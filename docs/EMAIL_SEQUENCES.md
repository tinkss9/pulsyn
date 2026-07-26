# PULSYN — EMAIL SEQUENCES (RESEND)

## Transactional Emails

### 1. Welcome Email
**Trigger:** User signs up
**Subject:** Welcome to Pulsyn — Your 763 connectors are ready
**From:** hello@pulsynai.com

```
Hi {{name}},

Welcome to Pulsyn! 🎉

You now have access to 763 data connectors with <1 second latency.

Here's what you can do right now:

1. **Try the demo** — https://pulsynai.com/demo (no signup required)
2. **Connect your first source** — https://pulsynai.com/dashboard/connectors
3. **Create a pipeline** — https://pulsynai.com/dashboard/pipelines

Your free plan includes:
- 3 pipelines
- 1,000 rows/day
- 5 connectors
- Community support

Need help? Reply to this email or check our docs.

Happy syncing!
The Pulsyn Team
```

### 2. Pipeline Created
**Trigger:** User creates a pipeline
**Subject:** Your pipeline "{{name}}" is live
**From:** hello@pulsynai.com

```
Hi {{name}},

Great news! Your pipeline "{{pipeline_name}}" is now live.

**Details:**
- Source: {{source_connector}}
- Target: {{target_connector}}
- Tables: {{table_count}}
- Mode: {{sync_mode}}

**What's next:**
1. Monitor your pipeline: https://pulsynai.com/dashboard/pipelines
2. Set up alerts: https://pulsynai.com/dashboard/pipelines/{{id}}/alerts
3. View data quality: https://pulsynai.com/dashboard/pipelines/{{id}}/quality

**Pro tip:** Set up email alerts for latency > 10s or error rate > 1%.

Happy syncing!
The Pulsyn Team
```

### 3. Upgrade Reminder
**Trigger:** User hits free tier limits
**Subject:** You've reached your free tier limit — Upgrade to Pro
**From:** hello@pulsynai.com

```
Hi {{name}},

You've been using Pulsyn a lot — that's great! 🎉

You've reached your free tier limit:
- Pipelines: {{pipeline_count}}/3
- Rows/day: {{row_count}}/1,000
- Connectors: {{connector_count}}/5

**Upgrade to Pro ($499/mo) and get:**
- 50 pipelines
- 1M rows/day
- 100 connectors
- AI-powered schema mapping
- Priority support

**Upgrade now:** https://pulsynai.com/pricing

Or contact us for a custom plan: hello@pulsynai.com

Happy syncing!
The Pulsyn Team
```

### 4. Weekly Digest
**Trigger:** Weekly (Monday 9am)
**Subject:** Your Pulsyn weekly digest
**From:** hello@pulsynai.com

```
Hi {{name}},

Here's your Pulsyn weekly digest:

**This week:**
- Rows synced: {{rows_synced}}
- Pipelines active: {{active_pipelines}}
- Errors: {{error_count}}
- Avg latency: {{avg_latency}}ms

**Top performing pipeline:**
- {{top_pipeline_name}}: {{top_pipeline_rows}} rows

**Action items:**
{{#if error_count}}
- ⚠️ {{error_count}} errors detected — Review logs
{{/if}}
{{#if high_latency}}
- ⚠️ High latency detected — Check source connectivity
{{/if}}

**Dashboard:** https://pulsynai.com/dashboard

Happy syncing!
The Pulsyn Team
```

## Marketing Emails

### 5. Product Hunt Launch
**Trigger:** Manual send
**Subject:** We just launched on Product Hunt — 763 connectors!
**From:** vishal@pulsynai.com

```
Hi {{name}},

We just launched Pulsyn on Product Hunt! 🚀

**What is Pulsyn?**
- 763 data connectors (more than Fivetran)
- <1 second latency (vs Fivetran's 15 minutes)
- 10x cheaper ($99-499/mo vs $500-50K/mo)
- AI-powered schema mapping
- Self-hosted option

**Support us on Product Hunt:**
[Product Hunt link]

**Try the demo:**
https://pulsynai.com/demo

**What people are saying:**
"Pulsyn has more connectors than any other CDC platform." — Data Engineer
"The pricing is a game-changer for startups." — CTO
"AI schema mapping saves us hours of manual work." — Data Analyst

Thanks for your support!
Vishal
Founder, Pulsyn
```

## Email Configuration (Resend)

```typescript
// packages/api/src/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: 'Pulsyn <hello@pulsynai.com>',
    to,
    subject,
    html,
  });
}
```

## Resend Setup
1. Go to https://resend.com
2. Create account
3. Add domain: pulsynai.com
4. Add DNS records (SPF, DKIM, DMARC)
5. Get API key
6. Add to Vercel env vars: RESEND_API_KEY
