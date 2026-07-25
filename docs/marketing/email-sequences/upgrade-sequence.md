# Pulsyn Upgrade Email Sequence

## Trigger: User on Community tier for 14+ days with active usage

### Email 1: Usage Alert
**Subject:** You're hitting your limits — time to upgrade?
**From:** team@pulsyn.io

Hi {{name}},

Great news — you're using Pulsyn enough to hit your plan limits!

**Your current usage:**
- Connectors: {{used}}/{{limit}}
- Rows replicated: {{rows_used}}/{{rows_limit}}/day
- Pipeline hours: {{hours_used}}/{{hours_limit}}/month

**Pro plan ($300/mo) gives you:**
- Unlimited pipelines and connectors
- 5M rows/day
- Web dashboard
- MCP server for AI agents
- API access
- Priority support

**Upgrade:** https://pulsyn.io/dashboard/billing

Best,
The Pulsyn Team

---

### Email 2: ROI Calculator
**Subject:** Calculate your Pulsyn ROI
**From:** team@pulsyn.io

Hi {{name}},

Let's do the math on Pulsyn Pro vs alternatives:

**Fivetran equivalent:** $500-2,000+/mo (usage-based)
**Confluent equivalent:** $895+/mo + usage fees
**Pulsyn Pro:** $300/mo (flat)

**Your savings:** $200-1,700+/month

Plus you get:
- Real-time latency (not 15-minute batches)
- CLI + API + MCP access
- Self-hosted option

**ROI: 67-85% cost reduction** with better performance.

Upgrade: https://pulsyn.io/dashboard/billing

Best,
The Pulsyn Team

---

### Email 3: Feature Comparison
**Subject:** Community vs Pro — what you're missing
**From:** team@pulsyn.io

Hi {{name}},

Here's exactly what you get when you upgrade:

| Feature | Community | Pro ($300/mo) |
|---------|-----------|---------------|
| Connectors | 3 | Unlimited |
| Rows/day | 50K | 5M |
| Web Dashboard | ✗ | ✓ |
| MCP Server | ✗ | ✓ (26 tools) |
| API Access | ✗ | ✓ |
| Data Masking | ✗ | ✓ |
| Support | Community | Priority |

**Most popular reason to upgrade:** MCP server for AI agent integration.

Upgrade: https://pulsyn.io/dashboard/billing

Best,
The Pulsyn Team
