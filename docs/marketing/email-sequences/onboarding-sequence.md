# Pulsyn Pro Onboarding Sequence

## Trigger: User upgrades to Pro

### Email 1: Welcome to Pro (Immediate)
**Subject:** Welcome to Pulsyn Pro — here's what's unlocked
**From:** team@pulsyn.io

Hi {{name}},

Welcome to Pulsyn Pro! You've unlocked the full platform.

**What's new for you:**

1. **Web Dashboard** — https://pulsyn.io/dashboard
   - Visual pipeline management
   - Real-time monitoring
   - Connector configuration

2. **MCP Server** — 26 tools for AI agents
   - Add to Claude/Cursor config
   - Control pipelines with natural language

3. **API Access** — https://pulsyn.io/api/docs
   - Full REST API with OpenAPI spec
   - Bearer token authentication

4. **CLI** — 35+ commands
   - `pulsyn pipeline *` — Pipeline management
   - `pulsyn connector *` — Connector management
   - `pulsyn billing *` — Billing management

**Next steps:**
1. Log in to the dashboard: https://pulsyn.io/dashboard
2. Create your first connector
3. Set up a pipeline
4. Enable MCP in your AI agent config

Best,
The Pulsyn Team

---

### Email 2: Day 3 — Advanced Features
**Subject:** Pro tip: In-flight data masking
**From:** team@pulsyn.io

Hi {{name}},

Quick feature spotlight: **In-flight data masking**.

Mask sensitive data while it's being replicated — not after.

**Available masking types:**
- `hash` — SHA-256 with salt
- `replace` — Configurable replacement string
- `format-preserving` — Pattern-based with * substitution
- `redact` — Hardcoded [REDACTED]

**Example:**
```json
{
  "masking": {
    "rules": [
      { "column": "email", "type": "hash" },
      { "column": "ssn", "type": "redact" },
      { "column": "phone", "type": "format-preserving", "pattern": "***-***-****" }
    ]
  }
}
```

Try it: `pulsyn pipeline create --masking config.json`

Best,
The Pulsyn Team

---

### Email 3: Day 7 — Check in
**Subject:** How's Pulsyn Pro working for you?
**From:** team@pulsyn.io

Hi {{name}},

It's been a week since you upgraded to Pro. Quick check-in:

**How's it going?**
- [ ] Created a pipeline? ✓/✗
- [ ] Connected to your database? ✓/✗
- [ ] Tried the MCP server? ✓/✗
- [ ] Used the web dashboard? ✓/✗

**Need help?**
- Docs: https://pulsyn.io/docs
- API: https://pulsyn.io/api/docs
- Reply to this email

**Feedback?** We'd love to hear what's working and what's not.

Best,
The Pulsyn Team
