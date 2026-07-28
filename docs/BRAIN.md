# Pulsyn Brain Agent — Strategy & Prioritization

## Role
The Brain strategizes what to build, in what order, and how to optimize the learning curve.

## Strategy Classification

| Category | Definition | Examples | Effort |
|----------|------------|----------|--------|
| **Quick Wins** | Existing connectors that just need tests | PostgreSQL, MySQL, MongoDB, Redis | 1-2 hours |
| **Common Connectors** | High-demand SaaS/database connectors | Salesforce, HubSpot, Stripe, Shopify | 2-4 hours |
| **Complex Connectors** | Multi-step, auth-heavy connectors | Kafka, Elasticsearch, BigQuery | 4-8 hours |
| **Stub Connectors** | Code exists but needs implementation | ClickHouse, Cassandra, DynamoDB | 8-16 hours |

## Brain Algorithm

```python
def strategize(connectors):
    # 1. Categorize by complexity
    quick_wins = [c for c in connectors if c.has_tests and c.pass_rate > 50%]
    common = [c for c in connectors if c.demand == 'high' and c.complexity == 'medium']
    complex = [c for c in connectors if c.complexity == 'high']
    stubs = [c for c in connectors if c.is_stub]
    
    # 2. Prioritize by impact/effort ratio
    prioritized = sorted(connectors, key=lambda c: c.demand / c.effort, reverse=True)
    
    # 3. Group into batches of 20
    batches = [prioritized[i:i+20] for i in range(0, len(prioritized), 20)]
    
    # 4. Assign to agents
    for batch in batches:
        yield {
            'agent': select_agent(batch),
            'connectors': batch,
            'strategy': determine_strategy(batch)
        }
```

## Brain Output Format

```json
{
  "batch_id": "batch-001",
  "strategy": "quick_wins",
  "connectors": ["postgresql", "mysql", "mongodb"],
  "agent": "deepseek",
  "estimated_time": "2 hours",
  "estimated_pass_rate": "85%",
  "dependencies": [],
  "risks": ["Docker containers needed"]
}
```

## Agent Assignment Logic

```python
def assign_agent(task):
    """Assign the best agent for a task"""
    if task.complexity == 'low' and task.type == 'code':
        return 'nvidia'  # Fast, free
    elif task.complexity == 'medium' and task.type == 'code':
        return 'deepseek'  # Good quality, cheap
    elif task.type == 'orchestration':
        return 'kimi'  # Best for handovers
    elif task.type == 'architecture':
        return 'mimo'  # Lead engineer
    else:
        return 'deepseek'  # Default
```

## Learning Curve Strategy

### Phase 1: Foundation (Hour 1)
- Build 50 quick wins (existing code, just needs tests)
- Learn common patterns
- Build knowledge base

### Phase 2: Scaling (Hour 2)
- Build 100 common SaaS connectors
- Apply learned patterns
- Reuse code from Phase 1

### Phase 3: Optimization (Hours 3-4)
- Build 150 complex connectors
- Apply advanced patterns
- Self-healing from failures

### Phase 4: Mastery (Hours 5-6)
- Build 100 remaining connectors
- Full pattern library
- Complete knowledge base

## Learning Curve Metrics

| Phase | Connectors | Pass Rate | Time | Learning |
|-------|------------|-----------|------|----------|
| 1 | 50 | 60% | 1h | Build foundation |
| 2 | 150 | 70% | 2h | Apply patterns |
| 3 | 300 | 80% | 2h | Self-healing |
| 4 | 400 | 85% | 1h | Mastery |
