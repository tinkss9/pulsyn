# Pulsyn — Top 20 SaaS Connector Verification Plan

**Goal:** Verify 20 most popular SaaS connectors work end-to-end before go-live.
**Timeline:** 1 week (this week)
**Owner:** Founder + AI agents

---

## Top 20 SaaS Connectors to Verify

### Tier 1: FREE Sandbox (No Credit Card) — Verify TODAY

| # | Connector | Free Tier | API Key | Signup Time | Priority |
|---|---|---|---|---|---|
| 1 | **Stripe** | ✅ Test mode (unlimited) | Test API key | 2 min | CRITICAL |
| 2 | **GitHub** | ✅ Free API (5K req/hr) | Personal access token | 2 min | CRITICAL |
| 3 | **Slack** | ✅ Free workspace | Bot token | 5 min | HIGH |
| 4 | **Google Sheets** | ✅ Free API | OAuth (Google Cloud) | 10 min | HIGH |
| 5 | **Notion** | ✅ Free API | Integration token | 5 min | HIGH |
| 6 | **Airtable** | ✅ Free API | Personal access token | 5 min | HIGH |
| 7 | **Linear** | ✅ Free API | Personal API key | 2 min | HIGH |
| 8 | **Calendly** | ✅ Free API | Personal access token | 5 min | MEDIUM |

### Tier 2: Free Trial (Credit Card Required) — Verify This Week

| # | Connector | Free Trial | API Key | Signup Time | Priority |
|---|---|---|---|---|---|
| 9 | **Salesforce** | ✅ Developer Edition (free forever) | Connected App OAuth | 15 min | CRITICAL |
| 10 | **HubSpot** | ✅ Free CRM + API key | API key | 5 min | CRITICAL |
| 11 | **Shopify** | ✅ Partner dev store (free) | Admin API token | 10 min | HIGH |
| 12 | **Mailchimp** | ✅ Free tier (500 contacts) | API key | 5 min | HIGH |
| 13 | **Twilio** | ✅ Free trial ($15 credit) | Account SID + Auth token | 10 min | MEDIUM |
| 14 | **SendGrid** | ✅ Free tier (100 emails/day) | API key | 5 min | MEDIUM |
| 15 | **Intercom** | ✅ Free trial | Access token | 10 min | MEDIUM |

### Tier 3: Popular But Paid — Verify With Mock/Sandbox

| # | Connector | Sandbox Option | Approach | Priority |
|---|---|---|---|---|
| 16 | **Jira** | ✅ Free Cloud instance | API token | HIGH |
| 17 | **Google Analytics** | ✅ GA4 Demo Account | OAuth | HIGH |
| 18 | **Facebook Ads** | ✅ Marketing API Sandbox | App token | MEDIUM |
| 19 | **Google Ads** | ✅ Test accounts | OAuth | MEDIUM |
| 20 | **Zendesk** | ✅ Free trial | API token | MEDIUM |

---

## Verification Checklist (Per Connector)

For each connector, verify:

```
□ [  ] Connect — API key auth works
□ [  ] Test Connection — Health check passes
□ [  ] List Resources — Can list tables/objects
□ [  ] Fetch Data — Can retrieve records
□ [  ] Pagination — Handles >100 records
□ [  ] Error Handling — Graceful on invalid auth
□ [  ] Rate Limiting — Respects API limits
□ [  ] Schema Discovery — Returns field types
```

---

## Quick Wins (Verify in 1 Hour)

These 5 connectors have the simplest API key setup:

1. **Stripe** — Go to https://dashboard.stripe.com/test/apikeys → Copy test key
2. **GitHub** — Go to https://github.com/settings/tokens → Generate token
3. **Notion** — Go to https://www.notion.so/my-integrations → Create integration
4. **Linear** — Go to https://linear.app/settings/api → Generate key
5. **Airtable** — Go to https://airtable.com/create/tokens → Generate token

---

## Verification Script

```bash
# Run connector verification
node scripts/verify-saas-connectors.js --connector stripe --api-key sk_test_xxx
node scripts/verify-saas-connectors.js --connector github --api-key ghp_xxx
node scripts/verify-saas-connectors.js --connector hubspot --api-key xxx
```

---

## Success Criteria

- [ ] 20/20 connectors pass connection test
- [ ] 20/20 connectors pass data fetch test
- [ ] 15/20 connectors pass pagination test
- [ ] All errors handled gracefully
- [ ] Documentation updated with setup guides
- [ ] Screenshot proof for each connector

---

## Timeline

| Day | Tasks | Connectors |
|---|---|---|
| **Day 1 (Today)** | Set up free sandbox accounts | Stripe, GitHub, Slack, Notion, Linear, Airtable |
| **Day 2** | Verify Tier 1 + set up Tier 2 | Google Sheets, Calendly + Salesforce, HubSpot |
| **Day 3** | Verify Tier 2 | Shopify, Mailchimp, Twilio, SendGrid, Intercom |
| **Day 4** | Verify Tier 3 | Jira, Google Analytics, Facebook Ads |
| **Day 5** | Fix issues + documentation | All 20 connectors |
| **Day 6** | Create setup guides | Video walkthroughs |
| **Day 7** | Final verification + launch prep | All 20 connectors confirmed |

---

## AI Self-Service Model

### The Vision

**Customers try Pulsyn themselves — no sales call, no setup guide, no human needed.**

Like calling MiMo, ChatGPT, or Claude — customers interact with an AI that:
1. Understands their data integration needs
2. Recommends the right connectors
3. Sets up the pipeline automatically
4. Monitors and troubleshoots issues

### How It Works

```
Customer: "I want to sync my Shopify orders to PostgreSQL"

AI Agent: "I'll set that up for you. Let me:
1. Connect to your Shopify store (here's the API key setup)
2. Connect to your PostgreSQL database (here's the connection string)
3. Create a replication pipeline for orders table
4. Start CDC replication

Your data is now flowing in real-time. Here's your dashboard: [link]"
```

### Implementation

1. **MCP Server** — AI agents use our 26 tools
2. **Natural Language Interface** — ChatGPT/Claude/Cursor integration
3. **Self-Service Portal** — Guided setup wizard
4. **AI Troubleshooting** — Auto-diagnose connection issues

### The Moat

**No other CDC platform has this.** Fivetran requires sales calls. Airbyte requires technical setup. Qlik requires enterprise contracts.

**Pulsyn: "Just tell the AI what you want."**

---

## Online Labs & Documentation

### Free Sandbox Environments

| Service | Sandbox | URL |
|---|---|---|
| **Stripe** | Test mode (unlimited) | https://dashboard.stripe.com/test |
| **Salesforce** | Developer Edition | https://developer.salesforce.com/signup |
| **HubSpot** | Free CRM | https://app.hubspot.com/signup |
| **Shopify** | Partner dev store | https://partners.shopify.com |
| **GitHub** | Free API | https://github.com/settings/tokens |
| **Google** | Cloud Console free tier | https://console.cloud.google.com |
| **Slack** | Free workspace | https://slack.com/create |
| **Notion** | Free API | https://www.notion.so/my-integrations |
| **Linear** | Free API | https://linear.app/settings/api |
| **Airtable** | Free API | https://airtable.com/create/tokens |

### Documentation to Reference

| Connector | API Docs | Sandbox Guide |
|---|---|---|
| Stripe | https://stripe.com/docs/api | https://stripe.com/docs/testing |
| Salesforce | https://developer.salesforce.com/docs | https://developer.salesforce.com/signup |
| HubSpot | https://developers.hubspot.com/docs | https://developers.hubspot.com/docs/api/overview |
| GitHub | https://docs.github.com/rest | https://docs.github.com/en/authentication |
| Slack | https://api.slack.com/reference | https://api.slack.com/start/overview |

---

## Action Items

### TODAY (Founder)

- [ ] Create Stripe test account → get test API key
- [ ] Create GitHub personal access token
- [ ] Create Notion integration token
- [ ] Create Linear API key
- [ ] Create Airtable personal access token
- [ ] Share API keys with AI agents for verification

### THIS WEEK (AI Agents)

- [ ] Build connector verification script
- [ ] Test all 20 connectors end-to-end
- [ ] Document setup guides for each connector
- [ ] Create video walkthroughs
- [ ] Update connector certification badges

### NEXT WEEK (Go-Live Prep)

- [ ] Publish setup guides on docs.pulsyn.io
- [ ] Create "Try Pulsyn in 5 minutes" tutorial
- [ ] Set up AI self-service chat
- [ ] Launch beta program
- [ ] Collect first 10 customer testimonials

---

## The Race

**Fivetran has 700+ connectors that WORK.**
**We have 1,027 connectors that MIGHT work.**

**This week, we make 20 of them PROVEN.**

That's enough to:
- Win the first 50 customers
- Build social proof
- Establish credibility

**The question:** Will you share those API keys today so we can start verifying?
