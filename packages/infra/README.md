# Musira Infra (Pulumi on GCP)

This Pulumi project provisions:

- A static external IP and a Compute Engine VM (Debian 12)
- Docker + CapRover automatically installed via startup script
- MySQL 8 and Redis 7 deployed as CapRover apps with persistent volumes
- Firewall rules for SSH, HTTP, HTTPS and CapRover admin port (3000)

## Prerequisites (one-time)

- Install Pulumi: https://www.pulumi.com/docs/install/
- Install Google Cloud CLI and authenticate: https://cloud.google.com/sdk/docs/install
- Set your GCP project, region and zone:
  - gcloud auth login
  - gcloud config set project <YOUR_PROJECT_ID>
  - gcloud config set compute/region europe-west9 # Paris
  - gcloud config set compute/zone europe-west9-b # Paris
- Ensure your user has permissions to create Compute and SQL resources.

## Configure and deploy

From this directory:

```
npm i
npx pulumi stack init dev   # if not created yet
npx pulumi stack select dev

# Set config values (optional overrides)
pulumi config set gcp:project <YOUR_PROJECT_ID>
pulumi config set gcp:region europe-west9
pulumi config set gcp:zone europe-west9-b
pulumi config set infra:machineType e2-standard-4
pulumi config set infra:caproverDomain captain.example.com

# Deploy
npm run up
```

When done, Pulumi will output:

- instanceIp: VM external IP
- caproverDashboard: CapRover admin URL (http://IP:3000)
- MySQL/Redis connection details (hostnames and generated credentials)

## Manual actions required

1. Create a DNS A record for your CapRover domain (e.g. captain.example.com) pointing to instanceIp.
2. Visit http://<instanceIp>:3000 (or your domain once DNS propagates) to finish CapRover setup (set admin password, enable HTTPS, etc.).
3. In CapRover dashboard:
   - The Pulumi script pre-creates MySQL (`musira-mysql`) and Redis (`musira-redis`) with persistent storage.
   - Create an app for the backend (e.g. `musira-backend`) or set `infra:backendApp` so it is created automatically.
   - Provide your image from GHCR or build via CapRover. The script sets env vars on the backend app: `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`. Use `srv-captain--musira-mysql` as host.
   - For Redis, host is `srv-captain--musira-redis` and password is exported by Pulumi output.
   - Set `ORIGIN` to your frontend URL (Cloudflare Pages/Workers). Set `COOKIE_SECURE=true` in production.
4. Frontend deployment (Cloudflare):
   - Build the frontend package: npm --workspace @musira/frontend run build
   - Use wrangler deploy from packages/frontend (script already present).
   - Frontend now calls the absolute API URL from environment.\*.ts (no worker proxy).

## Destroy

```
npm run destroy
```

## DNS with Cloudflare

- Create a zone for your apex domain (e.g. musira.fr) in Cloudflare and delegate your registrar to Cloudflare nameservers.
- Configure GitHub secrets for the infra workflow: CF_API_TOKEN (DNS edit), CF_ACCOUNT_ID, CF_ZONE_ID, APEX_DOMAIN (e.g. musira.fr).
- Pulumi can create:
  - api.<apex> A record to the VM IP (not proxied)
  - captain.<apex> A record to the VM IP (not proxied)
  - apex record is left as a placeholder if using Pages/Workers; update per your setup

## Notes & Backup Strategy

- CapRover initially exposes port 3000; once HTTPS is enabled inside CapRover, use your domain over 443.
- Ensure GHCR/registry access for CapRover if you pull private images.
- Backups:
  - MySQL: run a job/container with `mysqldump --single-transaction` against `srv-captain--musira-mysql` and upload to object storage (e.g., GCS bucket). Schedule with a cron container (CapRover app) using a service account key.
  - Redis: persistence is enabled (AOF every second). Optionally, run a job to copy `/data/appendonly.aof` (and `dump.rdb` if enabled) from the Redis volume to object storage.
  - CapRover config: back up `/captain/data/` directory from the VM for app configs and certificates. You can snapshot the VM disk or rsync this path regularly.
