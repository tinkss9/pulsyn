# Pulsyn Nerve Agent — Execution & Self-Healing

## Role
The Nerve executes the Brain's strategy, building connectors at scale.

## Execution Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NERVE EXECUTION PIPELINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐          │
│  │ PLAN    │───►│ BUILD   │───►│ TEST    │───►│ SHIP    │          │
│  │         │    │         │    │         │    │         │          │
│  │ • Read  │    │ • Code  │    │ • Unit  │    │ • Commit│          │
│  │   spec  │    │ • Mock  │    │ • Integ │    │ • Push  │          │
│  │ • Check │    │ • Impl  │    │ • E2E   │    │ • Deploy│          │
│  │   memory│    │ • Fix   │    │ • Bench │    │ • Update│          │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘          │
│       │              │              │              │                 │
│       ▼              ▼              ▼              ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SELF-HEALING LOOP                         │   │
│  │  • Detect failure → Analyze root cause → Apply fix → Retry  │   │
│  │  • Learn from failure → Store in memory → Prevent recurrence│   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Nerve Agent Assignment

| Agent | Role | Best For | Cost/1M |
|-------|------|----------|---------|
| **DeepSeek** | Builder | Code generation, testing, debugging | $0.21 |
| **Kimi** | Orchestrator | Work splitting, handovers, context | $2.00 |
| **NVIDIA** | Fast inference | Batch processing, quick iterations | Free |
| **MiMo** | Lead engineer | Architecture, review, decisions | $0.20 |

## Execution Strategy

```python
def execute_batch(batch):
    for connector in batch.connectors:
        # 1. Check memory for existing knowledge
        knowledge = memory.recall(connector.name)
        
        # 2. If pattern exists, reuse it
        if knowledge.pattern:
            apply_pattern(connector, knowledge.pattern)
        else:
            # 3. Build from scratch
            build_connector(connector)
        
        # 4. Test
        results = test_connector(connector)
        
        # 5. Learn from results
        memory.learn(connector, results)
        
        # 6. Update tracker
        tracker.update(connector, results)
```

## Self-Healing Loop

```python
def self_heal(connector, error):
    """Self-healing from failures"""
    # 1. Analyze error
    analysis = analyze_error(error)
    
    # 2. Check memory for similar failures
    similar = memory.recall_failure(analysis.error_type)
    
    # 3. If solution exists, apply it
    if similar.solution:
        apply_solution(connector, similar.solution)
    else:
        # 4. Generate new solution
        solution = generate_solution(analysis)
        memory.learn_failure(analysis, solution)
        apply_solution(connector, solution)
    
    # 5. Retry
    return retry_connector(connector)
```

## Mockito-Inspired Testing Patterns

### Key Learnings from Mockito

1. **Test Spy Model** — Stub, execute, verify (not expect-run-verify)
2. **Don't mock what you don't own** — Create wrappers, mock your wrappers
3. **@Spy Abstract Fakes** — For connectors with state (connection pools, retry logic)
4. **ArgumentCaptor** — Capture what code passes to connectors
5. **BDD Syntax** — Given-When-Then for readable test scenarios

### Application to Pulsyn

```typescript
// Mockito-inspired connector test pattern
describe('PostgreSQL Connector', () => {
    let connector: PostgreSQLConnector;
    let mockPool: MockPool;
    
    beforeEach(() => {
        mockPool = new MockPool();
        connector = new PostgreSQLConnector('test', 'test', mockPool);
    });
    
    it('should retry on transient failure', async () => {
        // Given
        mockPool.failNextAttempts(2);
        
        // When
        await connector.connect(config);
        
        // Then
        expect(mockPool.connectionAttempts).toBe(3);
        expect(connector.isConnected()).toBe(true);
    });
    
    it('should capture query parameters', async () => {
        // Given
        const captor = new ArgumentCaptor();
        
        // When
        await connector.extractFull('users');
        
        // Then
        expect(captor.capture().query).toContain('SELECT * FROM users');
    });
});
```

## Army of AI Agents

### Agent Assignment

| Agent | Role | Best For | Cost/1M |
|-------|------|----------|---------|
| **DeepSeek** | Builder | Code generation, testing, debugging | $0.21 |
| **Kimi** | Orchestrator | Work splitting, handovers, context | $2.00 |
| **NVIDIA** | Fast inference | Batch processing, quick iterations | Free |
| **MiMo** | Lead engineer | Architecture, review, decisions | $0.20 |

### Work Distribution

```python
def distribute_work(connectors, agents):
    """Distribute connectors across agents"""
    batches = []
    for i, connector in enumerate(connectors):
        agent = agents[i % len(agents)]
        batches.append({
            'connector': connector,
            'agent': agent,
            'priority': calculate_priority(connector)
        })
    return sorted(batches, key=lambda b: b['priority'], reverse=True)
```
