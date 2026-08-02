# Pulsyn Cloud Credential Setup

## Overview

The remaining 2 critical issues require real cloud credentials:
1. **177 failing tests** — Need AWS, GCP, SaaS API keys
2. **Connector test coverage** — Need credentials for each connector

## Required Credentials

### Tier 1: Essential (Top 10 Connectors)

These credentials will fix the most critical connector tests:

| Connector | Credential | Env Variable | Where to Get |
|-----------|------------|--------------|--------------|
| **PostgreSQL** | Connection string | `PG_CONNECTION_STRING` | Supabase or local Docker |
| **MySQL** | Connection string | `MYSQL_CONNECTION_STRING` | PlanetScale or local Docker |
| **MongoDB** | Connection string | `MONGODB_CONNECTION_STRING` | MongoDB Atlas (free tier) |
| **Redis** | Connection string | `REDIS_CONNECTION_STRING` | Upstash (free tier) |
| **DynamoDB** | AWS credentials | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS IAM |
| **S3** | AWS credentials | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS IAM |
| **Kafka** | Bootstrap servers | `KAFKA_BOOTSTRAP_SERVERS` | Confluent Cloud (free tier) |
| **Elasticsearch** | Connection string | `ELASTICSEARCH_URL` | Elastic Cloud (free trial) |
| **Supabase** | URL + key | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard |
| **Stripe** | API key | `STRIPE_SECRET_KEY` | Stripe dashboard |

### Tier 2: SaaS Connectors

| Connector | Credential | Env Variable | Where to Get |
|-----------|------------|--------------|--------------|
| **GitHub** | Personal access token | `GITHUB_TOKEN` | GitHub Settings → Developer |
| **Slack** | Bot token | `SLACK_BOT_TOKEN` | Slack API |
| **HubSpot** | API key | `HUBSPOT_API_KEY` | HubSpot Developer |
| **Shopify** | Access token | `SHOPIFY_ACCESS_TOKEN` | Shopify Partners |
| **Stripe** | API key | `STRIPE_API_KEY` | Stripe Dashboard |
| **Jira** | API token | `JIRA_API_TOKEN` | Atlassian Account |
| **Salesforce** | Access token | `SALESFORCE_ACCESS_TOKEN` | Salesforce Setup |
| **Twilio** | Auth token | `TWILIO_AUTH_TOKEN` | Twilio Console |
| **SendGrid** | API key | `SENDGRID_API_KEY` | SendGrid Settings |
| **Segment** | Write key | `SEGMENT_WRITE_KEY` | Segment Sources |

### Tier 3: Cloud Providers

| Provider | Credential | Env Variable | Where to Get |
|----------|------------|--------------|--------------|
| **AWS** | Access key + secret | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS IAM |
| **GCP** | Service account JSON | `GOOGLE_APPLICATION_CREDENTIALS` | GCP Console |
| **Azure** | Connection string | `AZURE_STORAGE_CONNECTION_STRING` | Azure Portal |

## Setup Instructions

### 1. Create `.env` file

```bash
cp .env.example .env
```

### 2. Add credentials to `.env`

```bash
# Database
PG_CONNECTION_STRING=postgresql://user:pass@host:5432/db
MYSQL_CONNECTION_STRING=mysql://user:pass@host:3306/db
MONGODB_CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/db
REDIS_CONNECTION_STRING=redis://default:pass@host:6379

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# SaaS
GITHUB_TOKEN=ghp_...
SLACK_BOT_TOKEN=xoxb-...
HUBSPOT_API_KEY=...
SHOPIFY_ACCESS_TOKEN=shpat_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_API_KEY=sk_test_...
JIRA_API_KEY=...
SALESFORCE_ACCESS_TOKEN=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=SG...
SEGMENT_WRITE_KEY=...

# Cloud
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=...
```

### 3. Run tests

```bash
# All connector tests
cd packages/core && npx vitest run src/__tests__/lab/connectors/

# Specific connector
cd packages/core && npx vitest run src/__tests__/lab/connectors/postgresql.test.ts

# Full test suite
npm test
```

### 4. Verify credentials

```bash
# Check which connectors are working
cd packages/core && npx vitest run src/__tests__/lab/connectors/ --reporter=json | jq '.testResults | length'
```

## Docker Lab Environment

For local testing, use the Docker lab environment:

```bash
# Start all services
docker-compose -f docker-compose.lab.yml up -d

# This starts:
# - PostgreSQL (port 5432)
# - MySQL (port 3306)
# - MongoDB (port 27017)
# - Redis (port 6379)
# - SQL Server (port 1433)
# - ClickHouse (port 8123)
# - Cassandra (port 9042)
# - Elasticsearch (port 9200)
# - Kafka (port 9092)
# - DynamoDB Local (port 8000)
# - LocalStack (port 4566)

# Connect with default credentials
PG_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/pulsyn
MYSQL_CONNECTION_STRING=mysql://root:root@localhost:3306/pulsyn
MONGODB_CONNECTION_STRING=mongodb://admin:admin@localhost:27017/pulsyn
REDIS_CONNECTION_STRING=redis://localhost:6379
```

## Priority Order

1. **PostgreSQL + Supabase** — Already working (health check passes)
2. **DynamoDB + S3** — AWS credentials needed
3. **MongoDB + Redis** — Free tier available
4. **GitHub + Stripe** — SaaS connectors
5. **GCP + Azure** — Cloud providers

## Cost Estimate

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| MongoDB Atlas | 512MB free | $9/mo |
| Upstash Redis | 10K commands/day free | $0.2/100K |
| Confluent Kafka | 400MB free | $0.11/GB |
| Elastic Cloud | 14-day trial | $95/mo |
| AWS | Free tier (12 months) | Pay-as-you-go |
| GCP | $300 credit | Pay-as-you-go |
| Stripe | Test mode free | 2.9% + 30¢ |

## Next Steps

1. Get Tier 1 credentials (essential connectors)
2. Run connector tests
3. Fix any failures
4. Get Tier 2 credentials (SaaS connectors)
5. Run full test suite
6. Deploy to production
