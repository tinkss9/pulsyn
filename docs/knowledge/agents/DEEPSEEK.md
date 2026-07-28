# DeepSeek Agent — Builder Role

## Capabilities
- Code generation
- Testing
- Debugging
- Documentation

## Best For
- Building connectors from scratch
- Fixing test failures
- Writing documentation
- Code review

## Cost
- $0.21 per 1M tokens

## Usage
```python
# Assign DeepSeek for code generation
agent = 'deepseek'
task = {
    'type': 'code',
    'complexity': 'medium',
    'description': 'Build PostgreSQL connector'
}
```

## Strengths
- Good quality code
- Fast execution
- Low cost
- Reliable

## Weaknesses
- May miss edge cases
- May not handle complex architectures
- May need review for critical code

## Example Tasks
1. Build new connector from template
2. Fix failing tests
3. Write documentation
4. Code review
