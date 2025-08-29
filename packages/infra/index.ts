import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';

import * as cf from '@pulumi/cloudflare';

const config = new pulumi.Config();
const project =
  gcp.config.project ?? pulumi.output(gcp.organizations.getProject()).projectId;
const region = gcp.config.region ?? 'europe-west1';
const zone = gcp.config.zone ?? 'europe-west1-b';

// Infra config
const machineType =
  config.get('machineType') ?? process.env.MACHINE_TYPE ?? 'e2-medium';
const dbTier = config.get('dbTier') ?? process.env.DB_TIER ?? 'db-f1-micro';
const dbVersion =
  config.get('dbVersion') ?? process.env.DB_VERSION ?? 'MYSQL_8_0';
const dbName = config.get('dbName') ?? process.env.DB_NAME ?? 'musira';
const dbUser = config.get('dbUser') ?? process.env.DB_USER ?? 'musira';
const caproverDomain =
  config.get('caproverDomain') ?? process.env.CAPROVER_DOMAIN ?? ''; // e.g. captain.example.com
const caproverEmail =
  config.get('caproverEmail') ?? process.env.CAPROVER_EMAIL ?? '';
const caproverAdminPassword =
  (config.getSecret('caproverAdminPassword') as
    | pulumi.Output<string>
    | undefined) ??
  (process.env.CAPROVER_ADMIN_PASSWORD
    ? pulumi.secret(process.env.CAPROVER_ADMIN_PASSWORD)
    : pulumi.secret(''));
const backendApp = config.get('backendApp') ?? process.env.BACKEND_APP ?? '';
const enableRedis = config.getBoolean('enableRedis') ?? true;
const cloudflareZone =
  config.get('cloudflareZone') ?? process.env.CLOUDFLARE_ZONE ?? '';
const apexDomain =
  config.get('apexDomain') ?? process.env.APEX_DOMAIN ?? 'musira.fr';

// Random password for DB user
const dbPassword = new random.RandomPassword('dbPassword', {
  length: 20,
  special: false,
}).result;

// Static external IP for the VM
const vmIp = new gcp.compute.Address('vm-ip', {
  addressType: 'EXTERNAL',
  region,
});

// Firewall to allow SSH, HTTP, HTTPS and CapRover admin port (3000)
const firewall = new gcp.compute.Firewall('vm-firewall', {
  network: 'default',
  allows: [{ protocol: 'tcp', ports: ['22', '80', '443', '3000'] }],
  direction: 'INGRESS',
  sourceRanges: ['0.0.0.0/0'],
});

// Service account for the instance
const sa = new gcp.serviceaccount.Account('vm-sa', {
  accountId: 'musira-vm-sa',
  displayName: 'Musira VM Service Account',
});

// Allow SA to pull images from GHCR if needed in future (placeholder; configure as needed)

// Cloud SQL instance
const sqlInstance = new gcp.sql.DatabaseInstance('mysql', {
  databaseVersion: dbVersion,
  region,
  settings: {
    tier: dbTier,
    ipConfiguration: {
      ipv4Enabled: true,
      // Authorize the VM external IP to access the DB
      authorizedNetworks: [
        {
          name: 'vm-access',
          value: vmIp.address,
        },
      ],
    },
    activationPolicy: 'ALWAYS',
    availabilityType: 'ZONAL',
    backupConfiguration: { enabled: true },
  },
});

const sqlDb = new gcp.sql.Database('db', {
  instance: sqlInstance.name,
  name: dbName,
});

const sqlUser = new gcp.sql.User('dbuser', {
  instance: sqlInstance.name,
  name: dbUser,
  password: dbPassword,
});

// Instance startup script: install Docker and CapRover
const startupScript = pulumi.interpolate`#!/bin/bash
set -euxo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl start docker

# Install Node.js, npm and Expect for headless CLI automation
apt-get install -y nodejs npm expect || true

# Install CapRover CLI
npm i -g caprover

# Start CapRover server container
docker run -e MAIN_NODE_IP_ADDRESS=$(curl -s http://checkip.amazonaws.com) \
  -e CAPROVER_ROOT_DOMAIN=${caproverDomain} \
  -p 80:80 -p 443:443 -p 3000:3000 \
  --cap-add=NET_ADMIN --restart=always -d caprover/caprover

# Wait for CapRover to become ready
echo "Waiting for CapRover..."
for i in $(seq 1 60); do
  if curl -fsS http://localhost:3000 >/dev/null; then echo Ready; break; fi
  sleep 5
done

# Optional headless CapRover server setup if domain/email/password provided
CAPROVER_DOMAIN="${caproverDomain}"
CAPROVER_EMAIL="${caproverEmail}"
CAPROVER_PASSWORD="${caproverAdminPassword}"

if [ -n "$CAPROVER_DOMAIN" ] && [ -n "$CAPROVER_EMAIL" ] && [ -n "$CAPROVER_PASSWORD" ]; then
  echo "Running CapRover headless serversetup..."
  /usr/bin/expect <<'EOS'
set timeout 600
spawn caprover serversetup
expect {
  -re ".*IP.*address.*" { send "127.0.0.1\r"; exp_continue }
  -re ".*(root|ROOT).*domain.*" { send "$env(CAPROVER_DOMAIN)\r"; exp_continue }
  -re ".*admin.*password.*" { send "$env(CAPROVER_PASSWORD)\r"; exp_continue }
  -re ".*confirm.*password.*" { send "$env(CAPROVER_PASSWORD)\r"; exp_continue }
  -re ".*(email|Email).*" { send "$env(CAPROVER_EMAIL)\r"; exp_continue }
  eof
}
EOS

  echo "Attempting CLI login to CapRover..."
  /usr/bin/expect <<'EOS'
set timeout 120
spawn caprover login
expect {
  -re ".*(CapRover|server).*(url|URL).*" { send "http://127.0.0.1:3000\r"; exp_continue }
  -re ".*(password|Password).*" { send "$env(CAPROVER_PASSWORD)\r"; exp_continue }
  -re ".*(set as default|default).*" { send "y\r"; exp_continue }
  eof
}
EOS
else
  echo "Skipping CapRover serversetup/login (missing CAPROVER_* values)"
fi

# Optionally pre-create backend app
BACKEND_APP_NAME="${backendApp}"
if [ -n "$BACKEND_APP_NAME" ]; then
  echo "Creating CapRover app $BACKEND_APP_NAME (if not exists)"
  caprover apps create -a "$BACKEND_APP_NAME" || true
fi
`;

// Compute Instance
const vm = new gcp.compute.Instance('musira-vm', {
  machineType,
  zone,
  bootDisk: {
    initializeParams: {
      image: 'debian-cloud/debian-12',
      size: 20,
      type: 'pd-balanced',
    },
  },
  networkInterfaces: [
    {
      network: 'default',
      accessConfigs: [
        {
          natIp: vmIp.address,
        },
      ],
    },
  ],
  serviceAccount: {
    email: sa.email,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  },
  metadataStartupScript: startupScript,
  tags: ['musira', 'caprover'],
});

export const instanceIp = vm.networkInterfaces.apply(
  (nics) => nics?.[0]?.accessConfigs?.[0]?.natIp ?? '',
);
export const instanceUrl = pulumi.interpolate`http://${instanceIp}`;
export const caproverDashboard = pulumi.interpolate`http://${instanceIp}:3000`;
export const cloudSqlConnectionName = sqlInstance.connectionName;
export const cloudSqlDb = sqlDb.name;
export const cloudSqlUser = sqlUser.name;
export const cloudSqlPassword = dbPassword;
export const cloudSqlPublicIp = sqlInstance.ipAddresses.apply(
  (ips) => ips?.[0]?.ipAddress ?? '',
);

// Optional: provision a Redis instance (Compute Engine + Docker) for BullMQ
let redisIp: pulumi.Output<string> | undefined;
if (enableRedis) {
  const redisVmIp = new gcp.compute.Address('redis-ip', {
    addressType: 'EXTERNAL',
    region,
  });
  const redisFirewall = new gcp.compute.Firewall('redis-firewall', {
    network: 'default',
    allows: [{ protocol: 'tcp', ports: ['6379'] }],
    direction: 'INGRESS',
    sourceRanges: ['0.0.0.0/0'],
  });
  const redisVm = new gcp.compute.Instance(
    'redis-vm',
    {
      machineType: 'e2-micro',
      zone,
      bootDisk: {
        initializeParams: {
          image: 'debian-cloud/debian-12',
          size: 10,
          type: 'pd-balanced',
        },
      },
      networkInterfaces: [
        {
          network: 'default',
          accessConfigs: [
            {
              natIp: redisVmIp.address,
            },
          ],
        },
      ],
      metadataStartupScript: `#!/bin/bash
set -eux
apt-get update && apt-get install -y docker.io
systemctl enable docker && systemctl start docker
docker run -d --name redis -p 6379:6379 --restart=always redis:7-alpine
`,
      tags: ['redis'],
    },
    { dependsOn: [redisFirewall] },
  );
  redisIp = redisVm.networkInterfaces.apply(
    (nics) => nics?.[0]?.accessConfigs?.[0]?.natIp ?? '',
  );
}

export const redisPublicIp = redisIp ?? pulumi.output('');

// Notes for wiring: you must configure DNS for caproverDomain to point to instanceIp.

// Cloudflare DNS records (optional)
let apiRecord: any | undefined;
let captainRecord: any | undefined;
if (cloudflareZone) {
  // api.musira.fr -> VM IP
  apiRecord = new cf.Record('api-dns', {
    zoneId: cloudflareZone,
    name: `api.${apexDomain}`,
    type: 'A',
    value: instanceIp,
    ttl: 300,
    proxied: false,
  });

  // Note: Apex and www custom domains will be attached to the Worker via wrangler in CI.

  // captain.musira.fr -> VM IP (CapRover admin)
  captainRecord = new cf.Record('captain-dns', {
    zoneId: cloudflareZone,
    name: `${caproverDomain}`,
    type: 'A',
    value: instanceIp,
    ttl: 300,
    proxied: false,
  });
}

export const cloudflareApiRecordName = apiRecord?.hostname ?? '';
export const cloudflareCaptainRecordName = captainRecord?.hostname ?? '';
