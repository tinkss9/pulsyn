# Kimi Agent — Orchestrator Role

## Capabilities
- Work splitting
- Handovers
- Context synthesis
- Planning

## Best For
- Complex multi-step tasks
- Coordinating multiple agents
- Managing handovers
- Planning and architecture

## Cost
- $2.00 per 1M tokens

## Usage
```python
# Assign Kimi for orchestration
agent = 'kimi'
task = {
    'type': 'orchestration',
    'complexity': 'high',
    'description': 'Coordinate connector development across multiple agents'
}
```

## Strengths
- Large context window (128K)
- Good at planning
- Excellent handover capabilities
- Strong synthesis

## Weaknesses
- Higher cost
- Slower than DeepSeek
- May over-engineer solutions

## Example Tasks
1. Plan connector development strategy
2. Coordinate multiple agents
3. Manage handovers between sessions
4. Synthesize context from multiple sources
