# Pulsyn — Community & Sandbox API Guide

**Finding free/test credentials for SaaS connectors without paying**

---

## Strategy: Use Developer Sandboxes, Not Production Keys

Most SaaS companies provide **free developer environments** specifically for testing integrations. These are better than free tiers because:
- No credit card required
- Unlimited test data
- No rate limits on test endpoints
- Reset/refresh data anytime

---

## Tier 1: Instant Access (No Signup Required)

### 1. Stripe — Test Mode (Already have)
- **URL:** dashboard.stripe.com/test/apikeys
- **Key format:** `sk_test_...`
- **Unlimited:** Test charges, customers, subscriptions
- **Test cards:** 4242 4242 4242 4242 (any future date, any CVC)
- **Status:** ✅ Already configured from 1INAI

### 2. GitHub — Personal Access Token (Already have)
- **URL:** github.com/settings/tokens
- **Key format:** `ghp_...`
- **Rate limit:** 5,000 req/hr
- **Status:** ✅ Already configured via `gh auth`

---

## Tier 2: Free Developer Accounts (5 min signup)

### 3. Slack — Free Workspace + Bot Token
**Signup:** slack.com/create
**Steps:**
1. Create free workspace (any name)
2. Go to api.slack.com/apps → Create New App
3. Select "From scratch" → name it "Pulsyn Test"
4. Install to workspace
5. Copy Bot User OAuth Token (`xoxb-...`)
**Env var:** `TEST_SLACK_BOT_TOKEN=xoxb-...`

### 4. Notion — Free Integration Token
**Signup:** notion.so/signup
**Steps:**
1. Create free account
2. Go to notion.so/my-integrations
3. Click "New integration"
4. Name it "Pulsyn Test"
5. Copy Internal Integration Secret (`ntn_...`)
**Env var:** `TEST_NOTION_TOKEN=ntn_...`

### 5. Airtable — Free Personal Access Token
**Signup:** airtable.com/signup
**Steps:**
1. Create free account
2. Go to airtable.com/create/tokens
3. Click "Create new token"
4. Name it "Pulsyn Test"
5. Select scopes: `data.records:read`, `schema.bases:read`
6. Copy token (`pat...`)
**Env var:** `TEST_AIRTABLE_TOKEN=pat...`

### 6. Linear — Free API Key
**Signup:** linear.app/signup
**Steps:**
1. Create free account
2. Go to linear.app/settings/api
3. Click "Create API key"
4. Name it "Pulsyn Test"
5. Copy key (`lin_...`)
**Env var:** `TEST_LINEAR_TOKEN=lin_...`

### 7. HubSpot — Free CRM + API Key
**Signup:** app.hubspot.com/signup
**Steps:**
1. Create free CRM account
2. Go to settings.hubspot.com/integrations/api
3. Click "Create private app"
4. Name it "Pulsyn Test"
5. Select scopes: `crm.objects.contacts.read`, `crm.objects.companies.read`
6. Copy token (`pat-na1-...`)
**Env var:** `TEST_HUBSPOT_TOKEN=pat-na1-...`

### 8. Calendly — Free Personal Access Token
**Signup:** calendly.com/signup
**Steps:**
1. Create free account
2. Go to calendly.com/integrations/api_webhooks
3. Click "Generate new token"
4. Copy token
**Env var:** `TEST_CALENDLY_TOKEN=...`

---

## Tier 3: Free Developer Editions (10 min signup)

### 9. Salesforce — Developer Edition (Free Forever)
**Signup:** developer.salesforce.com/signup
**Steps:**
1. Create Developer Edition account (free forever)
2. Go to Setup → Apps → App Manager → New Connected App
3. Enable OAuth Settings
4. Add callback URL: `http://localhost:3000/callback`
5. Copy Consumer Key and Consumer Secret
**Env vars:**
- `TEST_SALESFORCE_CLIENT_ID=3MVG9...`
- `TEST_SALESFORCE_CLIENT_SECRET=ABC123...`

### 10. Jira — Free Cloud Instance
**Signup:** atlassian.com/software/jira/free
**Steps:**
1. Create free Jira Cloud instance
2. Go to id.atlassian.com/manage-profile/security/api-tokens
3. Click "Create API token"
4. Copy token
**Env vars:**
- `TEST_JIRA_HOST=your-site.atlassian.net`
- `TEST_JIRA_USER=you@email.com`
- `TEST_JIRA_TOKEN=ATATT...`

### 11. Shopify — Partner Dev Store (Free)
**Signup:** partners.shopify.com
**Steps:**
1. Create Partner account
2. Create Development Store
3. Go to Settings → Apps → Develop apps
4. Create app → Configure Admin API scopes
5. Install app → Copy Admin API access token
**Env vars:**
- `TEST_SHOPIFY_SHOP=your-dev-store`
- `TEST_SHOPIFY_TOKEN=shpat_...`

### 12. Twilio — Free Trial ($15 credit)
**Signup:** twilio.com/try-twilio
**Steps:**
1. Create free account (get $15 credit)
2. Go to console.twilio.com
3. Copy Account SID and Auth Token
**Env vars:**
- `TEST_TWILIO_SID=AC...`
- `TEST_TWILIO_TOKEN=...`

### 13. SendGrid — Free Tier (100 emails/day)
**Signup:** sendgrid.com
**Steps:**
1. Create free account
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Select "Full Access"
5. Copy key (`SG...`)
**Env var:** `TEST_SENDGRID_KEY=SG...`

---

## Tier 4: Community/Demo APIs (No Signup)

### 14. JSONPlaceholder — Free REST API
- **URL:** jsonplaceholder.typicode.com
- **Endpoints:** /posts, /comments, /albums, /photos, /todos, /users
- **Use:** Test REST connector patterns
- **No auth required**

### 15. httpbin — HTTP Request/Response Testing
- **URL:** httpbin.org
- **Endpoints:** /get, /post, /put, /delete, /status, /delay
- **Use:** Test HTTP client implementations
- **No auth required**

### 16. ReqRes — Free REST API
- **URL:** reqres.in
- **Endpoints:** /api/users, /api/login, /api/register
- **Use:** Test authentication flows
- **No auth required**

### 17. PokéAPI — Free REST API
- **URL:** pokeapi.co
- **Endpoints:** /api/v2/pokemon, /api/v2/berry, etc.
- **Use:** Test pagination, nested resources
- **No auth required**

### 18. Open Library API
- **URL:** openlibrary.org/developers/api
- **Endpoints:** /api/books, /api/authors
- **Use:** Test search, pagination
- **No auth required**

---

## Tier 5: Mock/Sandbox APIs

### 19. Beeceptor — Mock API Server
- **URL:** beeceptor.com
- **Use:** Create mock endpoints for any API
- **Free tier:** 50 requests/day

### 20. Mockoon — Local Mock API
- **URL:** mockoon.com
- **Use:** Run local mock servers
- **Free:** Open source, unlimited

---

## Quick Setup Script

```bash
# Create .env.test with all test credentials
cat > .env.test << 'EOF'
# Tier 1: Already configured
TEST_GITHUB_TOKEN=$(gh auth token)

# Tier 2: Free developer accounts
TEST_SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN
TEST_NOTION_TOKEN=ntn-YOUR-TOKEN
TEST_AIRTABLE_TOKEN=pat-YOUR-TOKEN
TEST_LINEAR_TOKEN=lin-YOUR-TOKEN
TEST_HUBSPOT_TOKEN=pat-na1-YOUR-TOKEN
TEST_CALENDLY_TOKEN=YOUR-TOKEN

# Tier 3: Free developer editions
TEST_SALESFORCE_CLIENT_ID=YOUR-CLIENT-ID
TEST_SALESFORCE_CLIENT_SECRET=YOUR-CLIENT-SECRET
TEST_JIRA_HOST=your-site.atlassian.net
TEST_JIRA_USER=your@email.com
TEST_JIRA_TOKEN=ATATT-YOUR-TOKEN
TEST_SHOPIFY_SHOP=your-dev-store
TEST_SHOPIFY_TOKEN=shpat-YOUR-TOKEN
TEST_TWILIO_SID=AC-YOUR-SID
TEST_TWILIO_TOKEN=YOUR-TOKEN
TEST_SENDGRID_KEY=SG-YOUR-KEY

# Tier 4: No auth required (just use them)
TEST_JSONPLACEHOLDER_URL=https://jsonplaceholder.typicode.com
TEST_HTTPBIN_URL=https://httpbin.org
TEST_REQRES_URL=https://reqres.in
TEST_POKEAPI_URL=https://pokeapi.co
EOF
```

---

## Priority Order for Pulsyn

| Priority | Service | Impact | Time |
|----------|---------|--------|------|
| 1 | **Stripe** | ✅ Done | — |
| 2 | **GitHub** | ✅ Done | — |
| 3 | **Slack** | +18 tests | 5 min |
| 4 | **Notion** | +18 tests | 5 min |
| 5 | **Airtable** | +18 tests | 5 min |
| 6 | **Linear** | +18 tests | 2 min |
| 7 | **HubSpot** | +18 tests | 5 min |
| 8 | **Jira** | +18 tests | 10 min |
| 9 | **Salesforce** | +18 tests | 15 min |
| 10 | **JSONPlaceholder** | +18 tests | 0 min |

**Total:** 10 services, ~45 minutes, +180 tests passing

---

## Community API Resources

| Resource | URL | Use |
|----------|-----|-----|
| **Public APIs** | github.com/public-apis/public-apis | List of free public APIs |
| **RapidAPI** | rapidapi.com | Free tier APIs |
| **API Ninjas** | api-ninjas.com | Free API collection |
| **Abstract API** | abstractapi.com | Free API suite |
| **Twilio** | twilio.com/try-twilio | Free trial with $15 credit |
| **Stripe** | stripe.com/docs/testing | Unlimited test mode |
| **GitHub** | docs.github.com/rest | Free API with rate limits |
