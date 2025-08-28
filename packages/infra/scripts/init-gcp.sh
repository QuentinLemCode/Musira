PROJECT_ID="musiraproject"
POOL_ID="github-pool"
PROVIDER_ID="github-oidc"
SA_ID="pulumi-deployer"
OWNER="QuentinLemCode"
REPO="musira"

PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format="value(projectNumber)")

# Enable required services
gcloud services enable \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  --project "$PROJECT_ID"

# Create service account
gcloud iam service-accounts create "$SA_ID" \
  --project="$PROJECT_ID" \
  --display-name="CI Deploy SA"
SA_EMAIL="$SA_ID@$PROJECT_ID.iam.gserviceaccount.com"

# Add roles to service account
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/sql.admin"

# Optional if you need to manage networks/firewalls explicitly
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/compute.networkAdmin"

# Create workload identity pool
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create OIDC provider
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="$POOL_ID" \
  --display-name="GitHub OIDC Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.repository_owner=='QuentinLemCode' && assertion.repository=='musira'"