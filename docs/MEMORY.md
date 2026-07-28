# Pulsyn Memory System — Knowledge Base

## Architecture (Inspired by DevRev's GBrain)

DevRev's key insight: **"Recognition over retrieval"** — structured memory achieves 94.3% accuracy with 4.4x fewer tokens than RAG.

## Memory Layers

| Layer | Purpose | Storage | Retention |
|-------|---------|---------|-----------|
| **Session Memory** | Current conversation context | In-memory | Session only |
| **Task Memory** | Current task state | SQLite | Task lifetime |
| **Project Memory** | Project-wide knowledge | SQLite + files | Permanent |
| **Global Memory** | Cross-project patterns | SQLite | Permanent |

## Memory Schema

```sql
-- Connector knowledge
CREATE TABLE connector_knowledge (
    id INTEGER PRIMARY KEY,
    connector_name TEXT NOT NULL,
    engine TEXT NOT NULL,
    pass_rate REAL,
    test_count INTEGER,
    last_tested TIMESTAMP,
    issues JSONB,
    solutions JSONB,
    patterns JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pattern recognition
CREATE TABLE patterns (
    id INTEGER PRIMARY KEY,
    pattern_type TEXT NOT NULL,  -- 'connector', 'test', 'fix'
    pattern_name TEXT NOT NULL,
    description TEXT,
    examples JSONB,
    success_rate REAL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Learning from failures
CREATE TABLE failure_analysis (
    id INTEGER PRIMARY KEY,
    connector_name TEXT,
    error_type TEXT,
    error_message TEXT,
    root_cause TEXT,
    solution TEXT,
    prevention TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent performance tracking
CREATE TABLE agent_performance (
    id INTEGER PRIMARY KEY,
    agent_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    avg_time_ms INTEGER,
    cost_usd REAL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Memory Operations

```python
class Memory:
    def remember(self, key, value, context):
        """Store knowledge with context"""
        pass
    
    def recall(self, query, context):
        """Retrieve relevant knowledge"""
        pass
    
    def recognize(self, pattern):
        """Recognize patterns from past experience"""
        pass
    
    def learn(self, outcome):
        """Learn from success/failure"""
        pass
```

## Knowledge Base Structure

```
docs/knowledge/
├── README.md                    # Knowledge base overview
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

## Knowledge Capture

```python
def capture_knowledge(connector, result):
    """Capture knowledge from test results"""
    knowledge = {
        'connector': connector.name,
        'engine': connector.engine,
        'pass_rate': result.pass_rate,
        'test_count': result.test_count,
        'issues': result.failures,
        'patterns': extract_patterns(result),
        'solutions': find_solutions(result),
    }
    memory.remember(connector.name, knowledge)
```

## DevRev Learnings Applied

1. **Recognition over retrieval** — Memory system with pre-computed relationships
2. **Shared memory over message passing** — Single knowledge base for all agents
3. **Skills over tool calls** — Composable certification bundles
4. **Safe actions over black boxes** — Approval gates, traces, rollback
5. **Benchmarks over vibes** — Answer-preserving scaling
