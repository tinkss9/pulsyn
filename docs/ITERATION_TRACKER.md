# Pulsyn Iteration Tracker — Permanent Role

## Role
Tracks all iterations, shows progress dashboard, provides 15-minute updates, records decisions and results.

## Structure

### Current Iteration
- Iteration number
- Start time
- Progress dashboard (total tests, passing, failing, pass rate, connectors)
- Connector status table

### Iteration History
- Task description
- Status (done/in-progress/blocked)
- Tests before/after
- Delta (change in passing tests)

### Next Iterations
- Planned tasks
- Estimated time
- Dependencies

## Progress Dashboard

| Metric | Start | Current | Target |
|--------|-------|---------|--------|
| Total Tests | — | — | 400+ |
| Passing | — | — | 340+ |
| Failing | — | — | <60 |
| Pass Rate | — | — | 85%+ |
| Connectors | — | — | 400 |

## Connector Status

| Connector | Pass Rate | Status |
|-----------|-----------|--------|
| PostgreSQL | 85% | Production-ready |
| MySQL | 76% | Near production |
| MongoDB | 72% | Near production |
| MSSQL | 83% | Near production |
| Redis | 76% | Near production |
| R2 | 52% | Needs work |
| Supabase | 11% | Blocked |

## 15-Minute Update Format

```
## [Timestamp] — Iteration N Update

### Progress
- Total tests: X
- Passing: Y
- Failing: Z
- Pass rate: W%
- Connectors: N

### Changes
- [List of changes made]

### Blockers
- [List of blockers]

### Next Steps
- [List of next steps]
```

## Interaction with Other Roles

### With Lead Engineer
- Reports test results
- Receives feedback on quality
- Updates tracker with decisions

### With Scope Agent
- Reports scope changes
- Receives next connectors
- Updates tracker with scope

### With Brain Agent
- Reports strategy results
- Receives strategy recommendations
- Updates tracker with strategy

### With Nerve Agent
- Reports execution results
- Receives feedback on quality
- Updates tracker with execution
