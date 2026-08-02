#!/bin/bash
# Pulsyn Credential Checker
# Checks which cloud credentials are configured

echo "=========================================="
echo "  PULSYN CREDENTIAL CHECKER"
echo "=========================================="
echo ""

# Load .env if exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

check_cred() {
    local name=$1
    local var=$2
    if [ -n "${!var}" ]; then
        echo "✅ $name: Configured"
        return 0
    else
        echo "❌ $name: Missing ($var)"
        return 1
    fi
}

configured=0
missing=0

echo "=== DATABASE ==="
check_cred "PostgreSQL" "PG_CONNECTION_STRING" && ((configured++)) || ((missing++))
check_cred "MySQL" "MYSQL_CONNECTION_STRING" && ((configured++)) || ((missing++))
check_cred "MongoDB" "MONGODB_CONNECTION_STRING" && ((configured++)) || ((missing++))
check_cred "Redis" "REDIS_CONNECTION_STRING" && ((configured++)) || ((missing++))

echo ""
echo "=== AWS ==="
check_cred "AWS Access Key" "AWS_ACCESS_KEY_ID" && ((configured++)) || ((missing++))
check_cred "AWS Secret Key" "AWS_SECRET_ACCESS_KEY" && ((configured++)) || ((missing++))

echo ""
echo "=== CLOUD ==="
check_cred "GCP Credentials" "GOOGLE_APPLICATION_CREDENTIALS" && ((configured++)) || ((missing++))
check_cred "Azure Storage" "AZURE_STORAGE_CONNECTION_STRING" && ((configured++)) || ((missing++))

echo ""
echo "=== STREAMING ==="
check_cred "Kafka" "KAFKA_BOOTSTRAP_SERVERS" && ((configured++)) || ((missing++))
check_cred "Elasticsearch" "ELASTICSEARCH_URL" && ((configured++)) || ((missing++))

echo ""
echo "=== SAAS ==="
check_cred "GitHub" "GITHUB_TOKEN" && ((configured++)) || ((missing++))
check_cred "Slack" "SLACK_BOT_TOKEN" && ((configured++)) || ((missing++))
check_cred "HubSpot" "HUBSPOT_API_KEY" && ((configured++)) || ((missing++))
check_cred "Shopify" "SHOPIFY_ACCESS_TOKEN" && ((configured++)) || ((missing++))
check_cred "Stripe" "STRIPE_SECRET_KEY" && ((configured++)) || ((missing++))
check_cred "Jira" "JIRA_API_KEY" && ((configured++)) || ((missing++))
check_cred "Salesforce" "SALESFORCE_ACCESS_TOKEN" && ((configured++)) || ((missing++))
check_cred "Twilio" "TWILIO_AUTH_TOKEN" && ((configured++)) || ((missing++))
check_cred "SendGrid" "SENDGRID_API_KEY" && ((configured++)) || ((missing++))
check_cred "Segment" "SEGMENT_WRITE_KEY" && ((configured++)) || ((missing++))

echo ""
echo "=========================================="
echo "  SUMMARY"
echo "=========================================="
echo "  Configured: $configured"
echo "  Missing: $missing"
echo ""

if [ $missing -eq 0 ]; then
    echo "✅ All credentials configured! Run tests with:"
    echo "   cd packages/core && npx vitest run src/__tests__/lab/connectors/"
else
    echo "⚠️  $missing credentials missing."
    echo "   See docs/CREDENTIAL_SETUP.md for setup instructions."
    echo ""
    echo "   Quick start (free tier):"
    echo "   1. MongoDB Atlas: https://www.mongodb.com/atlas"
    echo "   2. Upstash Redis: https://upstash.com"
    echo "   3. Confluent Kafka: https://www.confluent.io/confluent-cloud/"
    echo "   4. AWS Free Tier: https://aws.amazon.com/free"
    echo "   5. Stripe Test Mode: https://dashboard.stripe.com"
    echo "   6. GitHub Token: https://github.com/settings/tokens"
fi
