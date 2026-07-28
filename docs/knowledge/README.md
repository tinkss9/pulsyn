# Pulsyn Knowledge Base

## Overview
This knowledge base captures patterns, issues, solutions, and learnings from connector development.

## Structure

```
docs/knowledge/
├── README.md                    # This file
├── connectors/
│   ├── INDEX.md                 # Connector index
│   ├── postgresql/
│   │   ├── PATTERNS.md          # Common patterns
│   │   ├── ISSUES.md            # Known issues
│   │   ├── SOLUTIONS.md         # Proven solutions
│   │   └── test-results.json    # Historical test data
│   └── ... (one directory per connector)
├── patterns/
│   ├── CONNECTION.md            # Connection patterns
│   ├── EXTRACTION.md            # Extraction patterns
│   ├── TESTING.md               # Testing patterns
│   └── SELF-HEALING.md          # Self-healing patterns
├── failures/
│   ├── COMMON.md                # Most common failures
│   └── SOLUTIONS.md             # Proven solutions
└── agents/
    ├── DEEPSEEK.md              # DeepSeek capabilities
    ├── KIMI.md                  # Kimi capabilities
    └── NVIDIA.md                # NVIDIA capabilities
```

## How to Use

### 1. Before Building a Connector
- Check `docs/knowledge/connectors/INDEX.md` for existing patterns
- Read `docs/knowledge/patterns/CONNECTION.md` for connection patterns
- Check `docs/knowledge/failures/COMMON.md` for known issues

### 2. During Development
- Follow patterns from `docs/knowledge/patterns/`
- Use test utilities from `packages/core/src/__tests__/lab/`
- Apply Mockito-inspired testing patterns

### 3. After Testing
- Update `docs/knowledge/connectors/<name>/test-results.json`
- Document any new issues in `docs/knowledge/connectors/<name>/ISSUES.md`
- Add solutions to `docs/knowledge/connectors/<name>/SOLUTIONS.md`

### 4. Learning from Failures
- Document failures in `docs/knowledge/failures/COMMON.md`
- Add solutions to `docs/knowledge/failures/SOLUTIONS.md`
- Update patterns if new patterns emerge

## Key Patterns

### Connection Patterns
- Standard JDBC/ODBC pattern for databases
- REST API pattern for SaaS connectors
- WebSocket pattern for real-time connectors

### Extraction Patterns
- Full extraction with pagination
- Incremental extraction with watermark
- CDC with Change Streams / WAL / Binlog

### Testing Patterns
- Mockito Test Spy model
- @Spy Abstract Fakes for stateful connectors
- ArgumentCaptor for protocol verification

### Self-Healing Patterns
- Retry with exponential backoff
- Circuit breaker for failing connectors
- Fallback to alternative connectors

## DevRev Learnings Applied

1. **Recognition over retrieval** — Memory system with pre-computed relationships
2. **Shared memory over message passing** — Single knowledge base for all agents
3. **Skills over tool calls** — Composable certification bundles
4. **Safe actions over black boxes** — Approval gates, traces, rollback
5. **Benchmarks over vibes** — Answer-preserving scaling
