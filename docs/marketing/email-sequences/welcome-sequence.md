# Pulsyn Welcome Email Sequence

## Trigger: User signs up for Community tier

### Email 1: Welcome (Immediate)
**Subject:** Welcome to Pulsyn — your first pipeline in 5 minutes
**From:** team@pulsyn.io

Hi {{name}},

Welcome to Pulsyn! You just joined the simplest CDC platform on the market.

**Your first pipeline in 5 minutes:**

1. Install the CLI: `npm install -g @pulsyn/cli`
2. Configure your connection: `pulsyn config set --host localhost --port 5432`
3. Create a pipeline: `pulsyn pipeline create --source postgres --target postgres`
4. Start replicating: `pulsyn pipeline start {{pipeline_id}}`

**Need help?**
- Docs: https://pulsyn.io/docs
- API Reference: https://pulsyn.io/api/docs
- Community: Discord (coming soon)

Happy replicating,
The Pulsyn Team

---

### Email 2: Day 3 — Feature Spotlight
**Subject:** Did you know? Pulsyn has an MCP server for AI agents
**From:** team@pulsyn.io

Hi {{name}},

Quick tip: Pulsyn is the first CDC platform with an MCP server.

**What this means:** You can control your pipelines from Claude, Cursor, or any AI agent.

**26 MCP tools available:**
- `pulsyn.pipeline.list` — List all pipelines
- `pulsyn.pipeline.create` — Create a new pipeline
- `pulsyn.connector.test` — Test a database connection
- `pulsyn.billing.status` — Check your subscription
- ...and 22 more

**Setup:** Add Pulsyn to your MCP config:
```json
{
  "pulsyn": {
    "command": "pulsyn-mcp",
    "env": {
      "PULSYN_API_URL": "https://api.pulsyn.io",
      "PULSYN_API_KEY": "your-key"
    }
  }
}
```

Try it out,
The Pulsyn Team

---

### Email 3: Day 7 — Upgrade Nudge
**Subject:** Ready for more? Pro plan gives you unlimited pipelines
**From:** team@pulsyn.io

Hi {{name}},

You've been using Pulsyn for a week! Here's what you're missing on the free tier:

**Community (current):**
- 3 connectors
- 50K rows/day
- CLI only

**Pro ($300/mo):**
- Unlimited pipelines
- All connectors
- Web dashboard
- MCP server (26 tools)
- API access
- In-flight masking
- Priority support

**Upgrade now:** https://pulsyn.io/dashboard/billing

Questions? Just reply to this email.

Best,
The Pulsyn Team

---

### Email 4: Day 14 — Case Study
**Subject:** How {{company}} reduced data latency from 15 minutes to 1 second
**From:** team@pulsyn.io

Hi {{name}},

Quick story: One of our users was syncing data with a batch ETL tool. Their dashboards showed 15-minute-old data.

After switching to Pulsyn:
- **Latency:** 15 minutes → 1 second
- **Cost:** $800/mo → $300/mo
- **Ops overhead:** 2 hours/week → 0

The switch took 30 minutes.

**Want the same result?** Reply to this email and I'll help you set it up.

Best,
The Pulsyn Team

---

### Email 5: Day 21 — Win-back
**Subject:** Still thinking about Pulsyn? Here's a special offer
**From:** team@pulsyn.io

Hi {{name}},

We noticed you haven't created a pipeline yet. No pressure — CDC can be complex.

**But here's the thing:** Pulsyn was built to make CDC simple. No Kafka, no enterprise sales calls, no $50K contracts.

**Special offer:** Get 50% off your first month of Pro with code `WELCOME50`.

**Or just try it free:**
1. `pulsyn pipeline create`
2. `pulsyn pipeline start`
3. Done.

Start now: https://pulsyn.io/signup

Best,
The Pulsyn Team
