import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';

import * as cf from '@pulumi/cloudflare';

const config = new pulumi.Config();
const project =
  gcp.config.project ?? pulumi.output(gcp.organizations.getProject()).projectId;
// Move infrastructure to Paris (europe-west9)
const region = gcp.config.region ?? 'europe-west9';
const zone = gcp.config.zone ?? 'europe-west9-b';

// Infra config
const machineType =
  config.get('machineType') ?? process.env.MACHINE_TYPE ?? 'e2-standard-4';
// Database config for CapRover MySQL one-click (no Cloud SQL anymore)
const dbName = config.get('dbName') ?? process.env.DB_NAME ?? 'musira';
const dbUser = config.get('dbUser') ?? process.env.DB_USER ?? 'musira';
const enableRedis = config.getBoolean('enableRedis') ?? true;
const apexDomain =
  config.get('apexDomain') ?? process.env.APEX_DOMAIN ?? 'musira.fr';
const caproverDomain =
  config.get('caproverDomain') ??
  process.env.CAPROVER_DOMAIN ??
  `captain.${apexDomain}`; // e.g. captain.example.com
const caproverEmail =
  config.get('caproverEmail') ?? process.env.CAPROVER_EMAIL ?? '';
const caproverAdminPassword = config.getSecret('caproverAdminPassword') ?? pulumi.secret(process.env.CAPROVER_ADMIN_PASSWORD);
if (!caproverAdminPassword) {
  throw new Error('CAPROVER_ADMIN_PASSWORD is required');
}
const backendApp = config.get('backendApp') ?? process.env.BACKEND_APP ?? '';
const mysqlApp =
  config.get('mysqlApp') ?? process.env.MYSQL_APP ?? 'musira-mysql';
const redisApp =
  config.get('redisApp') ?? process.env.REDIS_APP ?? 'musira-redis';
const cloudflareZone =
  config.get('cloudflareZone') ?? process.env.CLOUDFLARE_ZONE ?? '';

// Random password for DB user and root, and Redis
const dbPassword = new random.RandomPassword('dbPassword', {
  length: 20,
  special: false,
}).result;
const dbRootPassword = new random.RandomPassword('dbRootPassword', {
  length: 24,
  special: false,
}).result;
const redisPassword = new random.RandomPassword('redisPassword', {
  length: 24,
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

// Cloud SQL removed; MySQL & Redis will be provisioned as CapRover apps on the VM

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

# Start CapRover server container (accept terms, mount docker socket and data dir)
mkdir -p /captain
docker run -e ACCEPTED_TERMS=true \
  -e MAIN_NODE_IP_ADDRESS=$(curl -s http://checkip.amazonaws.com) \
  -e CAPROVER_ROOT_DOMAIN=${caproverDomain} \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /captain:/captain \
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

# Create MySQL and Redis apps on CapRover (if names provided / defaults)
MYSQL_APP_NAME="${mysqlApp}"
REDIS_APP_NAME="${redisApp}"
BACKEND_APP_NAME="${backendApp}"

create_or_skip_app() {
  local APP_NAME="$1"
  if [ -z "$APP_NAME" ]; then
    return 0
  fi
  echo "Creating CapRover app $APP_NAME (if not exists)"
  caprover apps create -a "$APP_NAME" || true
}

create_or_skip_app "$MYSQL_APP_NAME"
create_or_skip_app "$REDIS_APP_NAME"
create_or_skip_app "$BACKEND_APP_NAME"

# Configure MySQL app image, envs, and persistent directory (via CapRover API)
if [ -n "$MYSQL_APP_NAME" ]; then
  echo "Configuring MySQL app $MYSQL_APP_NAME"
  cat > /root/\${MYSQL_APP_NAME}-definition.json << JSONEOF
{
  "appName": "\${MYSQL_APP_NAME}",
  "appDefinition": {
    "schemaVersion": 2,
    "imageName": "mysql:8.0",
    "notExposeAsWebApp": true,
    "instanceCount": 1,
    "containerHttpPort": 0,
    "ports": [{"containerPort": 3306, "protocol": "tcp"}],
    "envVars": [
      {"key":"MYSQL_DATABASE","value":"${dbName}"},
      {"key":"MYSQL_USER","value":"${dbUser}"},
      {"key":"MYSQL_PASSWORD","value":"${dbPassword}"},
      {"key":"MYSQL_ROOT_PASSWORD","value":"${dbRootPassword}"}
    ],
    "volumes": [
      {"containerPath":"/var/lib/mysql","volumeName":"\${MYSQL_APP_NAME}-data"}
    ],
    "restartPolicy": "always"
  }
}
JSONEOF
  # Update definition (best-effort)
  caprover api --method POST --path /api/v2/apps/appDefinitions/update --dataFile /root/\${MYSQL_APP_NAME}-definition.json || true
fi

# Configure Redis app image, password, and persistence
if [ -n "$REDIS_APP_NAME" ]; then
  echo "Configuring Redis app $REDIS_APP_NAME"
  cat > /root/\${REDIS_APP_NAME}-definition.json << JSONEOF
{
  "appName": "\${REDIS_APP_NAME}",
  "appDefinition": {
    "schemaVersion": 2,
    "imageName": "redis:7-alpine",
    "notExposeAsWebApp": true,
    "instanceCount": 1,
    "containerHttpPort": 0,
    "ports": [{"containerPort": 6379, "protocol": "tcp"}],
    "envVars": [
      {"key":"REDIS_PASSWORD","value":"${redisPassword}"}
    ],
    "cmd": ["sh","-c","redis-server --appendonly yes --appendfsync everysec --requirepass ${redisPassword}"],
    "volumes": [
      {"containerPath":"/data","volumeName":"\${REDIS_APP_NAME}-data"}
    ],
    "restartPolicy": "always"
  }
}
JSONEOF
  caprover api --method POST --path /api/v2/apps/appDefinitions/update --dataFile /root/\${REDIS_APP_NAME}-definition.json || true
fi

# Configure backend app environment variables to connect to MySQL (if backend app provided)
if [ -n "$BACKEND_APP_NAME" ] && [ -n "$MYSQL_APP_NAME" ]; then
  echo "Setting backend env vars for DB connection"
  caprover api --method POST --path /api/v2/apps/envVars/set --data '{
    "appName": "'"$BACKEND_APP_NAME"'",
    "envVars": [
      {"key":"DATABASE_HOST","value":"srv-captain--'"$MYSQL_APP_NAME"'"},
      {"key":"DATABASE_PORT","value":"3306"},
      {"key":"DATABASE_USER","value":"'"$dbUser"'"},
      {"key":"DATABASE_PASSWORD","value":"'"$dbPassword"'"},
      {"key":"DATABASE_NAME","value":"'"$dbName"'"}
    ],
    "removeOthers": false
  }' || true
fi
`;

// Compute Instance
const vm = new gcp.compute.Instance('musira-vm', {
  machineType,
  zone,
  bootDisk: {
    initializeParams: {
      image: 'debian-cloud/debian-12',
      size: 50,
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
  // metadataStartupScript: startupScript,
  tags: ['musira', 'caprover'],
});

export const instanceIp = vm.networkInterfaces.apply(
  (nics) => nics?.[0]?.accessConfigs?.[0]?.natIp ?? '',
);
export const instanceUrl = pulumi.interpolate`http://${instanceIp}`;
export const caproverDashboard = pulumi.interpolate`http://${instanceIp}:3000`;
export const databaseHost = pulumi.interpolate`srv-captain--${mysqlApp}`;
export const databasePort = 3306;
export const databaseName = dbName;
export const databaseUser = dbUser;
export const databasePassword = dbPassword;
export const databaseRootPassword = dbRootPassword;
export const redisHost = pulumi.interpolate`srv-captain--${redisApp}`;
export const redisPort = 6379;
export const redisPasswordOut = redisPassword;

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
