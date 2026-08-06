# Pulsyn Connector Certification Plan — Next 100+ APIs

**Date:** 2026-08-07
**Goal:** Certify 200+ connectors with real API testing
**Current:** 159 verified (community) + 25 real API connectors built

---

## Phase 1: Autonomous Certification Loop (NOW)

### Pipeline
```
scripts/autonomous-cert-pipeline.ts
```

### What It Tests (per connector)
1. **Connectivity** — Can it connect? Latency?
2. **Schema Discovery** — Can it list tables/columns?
3. **Performance** — Throughput (rows/sec), latency (p50, p99)
4. **Volume** — 1000+ rows, memory usage
5. **Security** — Auth rejection, config masking
6. **Incremental** — Watermark-based extraction
7. **Error Handling** — Graceful failures

### Certification Thresholds
| Metric | Tier 1-2 | Tier 3-4 | Community |
|---|---|---|---|
| Pass rate | ≥95% | ≥90% | ≥80% |
| Latency p99 | ≤500ms | ≤1000ms | ≤2000ms |
| Throughput | ≥100 rows/s | ≥50 rows/s | ≥10 rows/s |
| Memory | ≤256MB | ≤512MB | ≤1GB |
| Auth reject | Must fail | Must fail | Skip |

---

## Phase 2: Free API Discovery (NEXT 100)

### Strategy
1. **Community APIs** (no auth) — 50+ more available
2. **Free sandbox APIs** — Stripe, Salesforce, HubSpot, etc.
3. **Docker databases** — 10+ more can be containerized
4. **Mock/WireMock** — Test SaaS connectors against mock servers

### Priority: APIs That Solve 100+ Use Cases Each

#### Tier 4: Advertising & Marketing (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 1 | LinkedIn Ads | Free developer app | B2B advertising |
| 2 | TikTok Marketing | Free developer account | Social advertising |
| 3 | Pinterest | Free developer app | Visual advertising |
| 4 | Snapchat Marketing | Free developer account | Social advertising |
| 5 | Bing Ads | Free sandbox | Search advertising |
| 6 | Twitter/X Ads | Free developer account | Social advertising |
| 7 | Reddit Ads | Free developer account | Community advertising |
| 8 | Quora Ads | Free developer account | Content advertising |
| 9 | Taboola | Free trial | Content discovery |
| 10 | Outbrain | Free trial | Content discovery |

#### Tier 5: Developer Tools (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 11 | GitHub | Free token | Code, issues, PRs |
| 12 | GitLab | Free token | Code, issues, CI/CD |
| 13 | Bitbucket | Free token | Code, issues |
| 14 | Sentry | Free tier | Error tracking |
| 15 | Datadog | Free tier | Monitoring |
| 16 | New Relic | Free tier | APM |
| 17 | PagerDuty | Free trial | Incident management |
| 18 | Opsgenie | Free tier | Alerting |
| 19 | CircleCI | Free tier | CI/CD |
| 20 | GitHub Actions | Free tier | CI/CD |

#### Tier 6: E-commerce (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 21 | WooCommerce | Free (self-hosted) | E-commerce |
| 22 | Magento | Free (open source) | E-commerce |
| 23 | BigCommerce | Free trial | E-commerce |
| 24 | Square | Free sandbox | POS + payments |
| 25 | Etsy | Free developer app | Marketplace |
| 26 | Amazon SP-API | Free developer app | Marketplace |
| 27 | eBay | Free developer app | Marketplace |
| 28 | Walmart | Free developer app | Marketplace |
| 29 | Stripe Connect | Free test mode | Platform payments |
| 30 | Braintree | Free sandbox | Payments |

#### Tier 7: Product Analytics (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 31 | Mixpanel | Free tier | Product analytics |
| 32 | Amplitude | Free tier | Product analytics |
| 33 | Heap | Free tier | Auto-capture analytics |
| 34 | FullStory | Free tier | Session replay |
| 35 | Hotjar | Free tier | Heatmaps |
| 36 | Pendo | Free tier | Product experience |
| 37 | PostHog | Free (open source) | Product analytics |
| 38 | Plausible | Free (self-hosted) | Privacy analytics |
| 39 | Fathom | Free trial | Privacy analytics |
| 40 | Mixpanel | Free tier | Event analytics |

#### Tier 8: Communication (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 41 | Twilio | Free trial | SMS, voice |
| 42 | SendGrid | Free tier (100/day) | Email API |
| 43 | MessageBird | Free trial | SMS, chat |
| 44 | Vonage | Free trial | SMS, voice |
| 45 | Discord | Free bot | Community chat |
| 46 | Telegram | Free bot | Messaging |
| 47 | WhatsApp Business | Free tier | Business messaging |
| 48 | Microsoft Graph | Free developer | Teams, Outlook |
| 49 | Google Workspace | Free developer | Gmail, Calendar |
| 50 | Zoom | Free developer | Video meetings |

#### Tier 9: Data & Analytics (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 51 | Google Sheets | Free API | Spreadsheet data |
| 52 | Google Drive | Free API | File storage |
| 53 | Dropbox | Free API | File storage |
| 54 | Box | Free developer | Enterprise storage |
| 55 | Airtable | Free tier | Low-code DB |
| 56 | Notion | Free API | Knowledge base |
| 57 | Confluence | Free Cloud | Documentation |
| 58 | SharePoint | Free developer | Enterprise docs |
| 59 | OneDrive | Free API | File storage |
| 60 | S3 | Free tier (12mo) | Object storage |

#### Tier 10: Finance & Accounting (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 61 | QuickBooks | Free sandbox | Accounting |
| 62 | Xero | Free trial | Accounting |
| 63 | FreshBooks | Free trial | Invoicing |
| 64 | Wave | Free tier | Accounting |
| 65 | Plaid | Free sandbox | Banking data |
| 66 | Yodlee | Free trial | Financial data |
| 67 | Stripe Treasury | Free test mode | Banking |
| 68 | Wise | Free sandbox | International transfers |
| 69 | Mercury | Free API | Banking |
| 70 | Brex | Free API | Corporate cards |

#### Tier 11: HR & Recruiting (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 71 | BambooHR | Free trial | HRIS |
| 72 | Workday | Free sandbox | Enterprise HR |
| 73 | Greenhouse | Free API | Recruiting |
| 74 | Lever | Free API | Recruiting |
| 75 | Gusto | Free API | Payroll |
| 76 | Rippling | Free API | HR + IT |
| 77 | DeShaw | Free API | Payroll |
| 78 | ADP | Free sandbox | Payroll |
| 79 | UKG | Free API | Workforce mgmt |
| 80 | Ceridian | Free API | HR |

#### Tier 12: Specialized (10 connectors)
| # | API | Free Access | Use Cases |
|---|---|---|---|
| 81 | ServiceNow | Free developer | ITSM |
| 82 | Salesforce Marketing | Free sandbox | Marketing automation |
| 83 | Salesforce Service | Free sandbox | Customer support |
| 84 | HubSpot Marketing | Free tier | Marketing |
| 85 | ActiveCampaign | Free trial | Email automation |
| 86 | Klaviyo | Free tier | E-commerce email |
| 87 | Customer.io | Free tier | Messaging automation |
| 88 | Braze | Free trial | Customer engagement |
| 89 | Iterable | Free trial | Cross-channel |
| 90 | Attentive | Free trial | SMS marketing |

---

## Phase 3: Certification Evidence Format

Each certified connector gets an entry in `docs/lab/cert-matrix.json`:

```json
{
  "id": "stripe-real",
  "name": "Stripe",
  "tier": 1,
  "status": "CERTIFIED",
  "passRate": 95.0,
  "tests": {
    "connectivity": { "passed": true, "latencyMs": 245 },
    "schemaDiscovery": { "passed": true, "tablesFound": 18 },
    "performance": { "passed": true, "throughputRowsSec": 450, "p50Ms": 120, "p99Ms": 380 },
    "volume": { "passed": true, "maxRowsTested": 1000, "memoryMB": 45 },
    "security": { "passed": true, "authReject": true, "configMasking": true },
    "incremental": { "passed": true },
    "errorHandling": { "passed": true }
  },
  "evidence": "19/20 tests passed, 450 rows/sec throughput",
  "certifiedAt": "2026-08-07T10:00:00Z",
  "method": "Vitest + live API"
}
```

---

## Phase 4: Autonomous Loop Script

```bash
# Run full certification
npx tsx scripts/autonomous-cert-pipeline.ts --mode full

# Run quick check (connectivity only)
npx tsx scripts/autonomous-cert-pipeline.ts --mode quick

# Test specific tier
npx tsx scripts/autonomous-cert-pipeline.ts --tier 1

# Test specific connector
npx tsx scripts/autonomous-cert-pipeline.ts --connector stripe
```

---

## Timeline

| Week | Focus | Connectors | Cumulative |
|---|---|---|---|
| 1 | Tier 1-2 real API testing | 25 | 184 |
| 2 | Tier 3 real API testing | 10 | 194 |
| 3 | Community API expansion | +50 | 244 |
| 4 | Tier 4-8 free sandbox testing | +40 | 284 |
| 5 | Tier 9-12 specialized testing | +40 | 324 |
| 6 | Performance + security hardening | — | 324 |

**Target: 300+ certified connectors by Week 6**
