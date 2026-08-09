# Pulsyn Knowledge Base Index

**Last Updated:** 2026-08-09
**Purpose:** Central knowledge repository for Pulsyn AI agents and developers

---

## Documentation Map

### Core Knowledge

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Connector Certification](CONNECTOR_CERTIFICATION.md) | 226 certified connectors, pass rates, benchmark results, methodology | 2026-08-09 |
| [README](README.md) | Knowledge base overview and usage guide | 2026-07-28 |

### Connector Knowledge

| Document | Description |
|----------|-------------|
| [Connector Index](connectors/INDEX.md) | Full connector catalog with status, pass rates, and patterns |

### Agent Knowledge

| Document | Description |
|----------|-------------|
| [NVIDIA Agent](agents/NVIDIA.md) | NVIDIA AI agent patterns and usage |
| [Kimi Agent](agents/KIMI.md) | Kimi agent patterns and orchestration |
| [DeepSeek Agent](agents/DEEPSEEK.md) | DeepSeek agent patterns and reasoning |

### Pattern Library

| Document | Description |
|----------|-------------|
| [Connection Patterns](patterns/CONNECTION.md) | Database and API connection patterns |
| [Extraction Patterns](patterns/EXTRACTION.md) | Data extraction and CDC patterns |
| [Testing Patterns](patterns/TESTING.md) | Testing strategies and patterns |
| [Self-Healing Patterns](patterns/SELF-HEALING.md) | Auto-recovery and resilience patterns |

### Failure Knowledge

| Document | Description |
|----------|-------------|
| [Common Failures](failures/COMMON.md) | Known failure modes and resolutions |

---

## Quick Reference

### By Topic

| Topic | Primary Document |
|-------|------------------|
| Connector pass rates | [Connector Certification](CONNECTOR_CERTIFICATION.md) §1 |
| Database connectors | [Connector Certification](CONNECTOR_CERTIFICATION.md) §3 |
| SaaS connectors | [Connector Certification](CONNECTOR_CERTIFICATION.md) §4 |
| Enterprise connectors | [Connector Certification](CONNECTOR_CERTIFICATION.md) §5 |
| Certification methodology | [Connector Certification](CONNECTOR_CERTIFICATION.md) §6 |
| Benchmark results | [Connector Certification](CONNECTOR_CERTIFICATION.md) §7 |
| Certification thresholds | [Connector Certification](CONNECTOR_CERTIFICATION.md) §8 |
| Connection patterns | [patterns/CONNECTION.md](patterns/CONNECTION.md) |
| CDC patterns | [patterns/EXTRACTION.md](patterns/EXTRACTION.md) |
| Testing patterns | [patterns/TESTING.md](patterns/TESTING.md) |

### By Connector Type

| Type | Lane | Count | Document |
|------|------|-------|----------|
| Database | B | 19 | [Connector Certification §3](CONNECTOR_CERTIFICATION.md#3-lane-b--database-connectors-full-list) |
| SaaS/API | A | 204 | [Connector Certification §4](CONNECTOR_CERTIFICATION.md#4-lane-a--saasapi-connectors-first-50) |
| Enterprise SaaS | C | 3 | [Connector Certification §5](CONNECTOR_CERTIFICATION.md#5-lane-c--enterprise-saas-connectors-3-connectors) |

### By Pass Rate

| Pass Rate | Count | Examples |
|-----------|-------|---------|
| 100% | 142 | PostgreSQL, MySQL, MongoDB, coinbase-rates, hackernews |
| 90-99% | 65 | xkcd, dogapi, harrypotter, hackernews-top (95.2%) |
| 80-89% | 12 | opennotify (85.7%), advice-slip (84.2%), wttr (84.2%) |
| 70-79% | 4 | genderize (73.7%), githubzen (73.7%), kafka (78.9%) |
| 50-69% | 3 | openfoodfacts (52.6%), zenquotes (52.6%), pokemontcg (60%) |

---

## Knowledge Maintenance

### Update Schedule

- **Connector Certification:** Updated on each certification run
- **Agent Knowledge:** Updated on agent changes
- **Pattern Library:** Updated when new patterns discovered
- **Failure Knowledge:** Updated on incident resolution

### How to Update

1. Modify the source document
2. Update the "Last Updated" date
3. Regenerate indexes if needed
4. Commit changes with descriptive message

---

## Source of Truth

| Data | Source File |
|------|-------------|
| Connector certification matrix | `docs/lab/cert-matrix.json` |
| Benchmark results | `packages/core/src/benchmark/results/*.json` |
| Certification methodology | `docs/CERTIFICATION_METHODOLOGY.md` |
| Connector patterns | `docs/knowledge/connectors/INDEX.md` |

---

*This index is maintained by AI agents. For manual updates, edit the source documents directly.*
