# Pulsyn Architecture

## Overview

Pulsyn is an AI-native Change Data Capture (CDC) platform built as a Turborepo monorepo. It provides real-time data replication without Kafka dependency or vendor lock-in.

## Monorepo Structure

```
pulsyn/
├── packages/
│   ├── core/          # CDC engine, connectors, events, checkpoint
│   ├── api/           # Express REST API server
│   ├── web/           # Next.js 14 frontend dashboard
│   ├── cli/           # Command-line interface
│   ├── mcp/           # MCP server for AI agent integration
│   ├── masking/       # In-flight data masking module
│   └── connectors/    # Empty placeholder package
├── docker/            # Production Docker configs
├── docs/              # Documentation
├── scripts/           # Utility scripts
├── tests/             # E2E and integration tests
└── turbo.json         # Turborepo task config
```

## Core Package (`packages/core`)

The core package contains the CDC engine, connectors, and event system.

### Directory Structure

```
packages/core/src/
├── connectors/        # 776 connector implementations
│   ├── base.ts        # BaseConnector abstract class
│   ├── registry.ts    # @registerSource / @registerTarget decorators
│   └── *.ts           # Individual connector files
├── engine/
│   └── cdc-engine.ts  # CDC engine implementation
├── events.ts          # Event types and createEvent()
├── checkpoint/
│   ├── checkpoint-manager.ts  # Checkpoint persistence
│   └── watermark.ts           # Watermark tracking
├── ai/
│   └── schema-mapper.ts       # AI-powered schema mapping
├── bi/
│   ├── dax-to-sql.ts          # DAX to SQL conversion
│   └── models.ts              # BI models
├── monitoring/
│   └── pipeline-monitor.ts    # Pipeline monitoring
├── types.ts           # TypeScript type definitions
└── index.ts           # Main exports
```

### BaseConnector

All connectors extend `BaseConnector`:

```typescript
export abstract class BaseConnector implements Connector {
  id: string;
  name: string;
  engine: string;
  config: DatabaseConfig;
  batchSize: number;
  protected connected: boolean = false;

  constructor(id: string, name: string, engine: string, config: DatabaseConfig, batchSize: number = 10000) {
    this.id = id;
    this.name = name;
    this.engine = engine;
    this.config = config;
    this.batchSize = batchSize;
  }

  // Core connection methods
  abstract connect(config?: DatabaseConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;

  // Schema discovery
  abstract getTables(): Promise<string[]>;
  abstract getTableSchema(table: string): Promise<TableSchema>;

  // Data extraction
  abstract extractFull(table: string): Promise<UnifiedChangeEvent[]>;
  abstract extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]>;

  // CDC (optional)
  async startCDC?(callback: (event: UnifiedChangeEvent) => void): Promise<void>;
  async stopCDC?(): Promise<void>;
}
```

### Connector Registry

Connectors are registered using decorators:

```typescript
export function registerSource(name: string) {
  return function (constructor: Function) {
    sources.set(name, constructor as any);
  };
}

export function registerTarget(name: string) {
  return function (constructor: Function) {
    targets.set(name, constructor as any);
  };
}
```

The registry creates connector instances:

```typescript
export class ConnectorRegistry {
  static getSource(name: string, id: string, config: DatabaseConfig, options?: any): BaseConnector {
    const cls = sources.get(name);
    if (!cls) {
      throw new Error(`Unknown source connector: ${name}. Available: ${sources.keys()}`);
    }
    return new cls(id, name, name, config);
  }
}
```

### Event System

Events represent data changes:

```typescript
export interface UnifiedChangeEvent {
  op: Operation;           // 'I' | 'U' | 'D' | 'S'
  table: string;           // Table name
  after: any | null;       // New data (for I/U/S)
  before: any | null;      // Old data (for D/U)
  ts: Date;                // Timestamp
  watermark: string | null; // Watermark value
  sourceMetadata: any;     // Source-specific metadata
}

export function createEvent(partial: Partial<UnifiedChangeEvent> & { op: Operation; table: string }): UnifiedChangeEvent {
  return {
    op: partial.op,
    table: partial.table,
    after: partial.after ?? null,
    before: partial.before ?? null,
    ts: partial.ts ?? new Date(),
    watermark: partial.watermark ?? null,
    sourceMetadata: partial.sourceMetadata ?? {},
  };
}
```

### CDC Engine

The CDC engine orchestrates data replication:

```typescript
export class CDCEngine {
  private source: BaseConnector;
  private target: BaseConnector;
  private checkpointManager: CheckpointManager;
  private pipelineMonitor: PipelineMonitor;

  async startPipeline(config: PipelineConfig): Promise<void> {
    // 1. Connect source and target
    // 2. Discover schema
    // 3. Start CDC or full extraction
    // 4. Process events
    // 5. Update checkpoint
  }
}
```

### Checkpoint System

The checkpoint system tracks replication progress:

```typescript
export class CheckpointManager {
  async saveCheckpoint(pipelineId: string, checkpoint: Checkpoint): Promise<void> {
    // Save to file or database
  }

  async loadCheckpoint(pipelineId: string): Promise<Checkpoint | null> {
    // Load from file or database
  }
}
```

## API Package (`packages/api`)

Express REST API server providing:

- Health check endpoint
- Pipeline management (CRUD)
- Connector management
- Schema discovery
- CDC stream management

### Key Endpoints

```
GET  /health              - Health check
GET  /api/pipelines       - List pipelines
POST /api/pipelines       - Create pipeline
GET  /api/pipelines/:id   - Get pipeline
PUT  /api/pipelines/:id   - Update pipeline
DELETE /api/pipelines/:id - Delete pipeline
GET  /api/connectors      - List connectors
POST /api/connectors      - Create connector
GET  /api/connectors/:id  - Get connector
```

## Web Package (`packages/web`)

Next.js 14 frontend dashboard with:

- Pipeline management UI
- Connector configuration
- Real-time monitoring
- Schema visualization
- Billing (Stripe integration)

### Key Pages

```
/                   - Homepage
/demo               - Interactive demo
/pricing            - Pricing tiers
/login              - Authentication
/signup             - Registration
/dashboard          - Main dashboard
/dashboard/pipelines - Pipeline management
/dashboard/connectors - Connector management
/dashboard/usage    - Usage tracking
/vs/fivetran        - Comparison page
/vs/airbyte         - Comparison page
/vs/confluent       - Comparison page
/vs/debezium        - Comparison page
```

## CLI Package (`packages/cli`)

Command-line interface with 35+ commands:

```bash
pulsyn config set <key> <value>     # Set configuration
pulsyn pipeline create              # Create pipeline
pulsyn pipeline start <id>          # Start pipeline
pulsyn connector list               # List connectors
pulsyn connector test <id>          # Test connector
pulsyn system status                # System status
```

## MCP Package (`packages/mcp`)

MCP server providing 26 tools for AI agent integration:

- `pipeline.create` - Create pipeline
- `pipeline.start` - Start pipeline
- `pipeline.stop` - Stop pipeline
- `connector.list` - List connectors
- `connector.test` - Test connector
- `schema.discover` - Discover schema
- etc.

## Masking Package (`packages/masking`)

In-flight data masking module:

```typescript
export class DataMasker {
  mask(value: any, rules: MaskingRule[]): any {
    // Apply masking rules to data
  }
}
```

## AI Agent System

### Brain Agent

Strategy and prioritization algorithm for connector builds:

```python
# scripts/brain.py
def prioritize_connectors(connectors):
    # Categorize by complexity and demand
    # Assign priority scores
    # Generate build batches
```

### Memory System

SQLite knowledge base with 4 layers:

```python
# scripts/memory.py
class MemorySystem:
    def __init__(self):
        self.db = sqlite3.connect('docs/knowledge/memory.db')
        # Tables: connector_knowledge, patterns, failure_analysis, agent_performance
```

### Nerve Agent

Execution pipeline with self-healing:

```python
# scripts/nerve.py
class NerveAgent:
    def execute(self, batch):
        # PLAN -> BUILD -> TEST -> SHIP
        # Self-healing loop on failure
```

## Data Flow

```
Source Database
      │
      ▼
┌─────────────┐
│  Connector  │  (extractFull / extractIncremental / startCDC)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Events    │  (UnifiedChangeEvent[])
└─────┬───────┘
      │
      ▼
┌─────────────┐
│  Checkpoint │  (save progress)
└─────┬───────┘
      │
      ▼
┌─────────────┐
│   Target    │  (write to target database)
└─────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (core, api, web, cli, mcp) |
| Runtime | Node.js 20 |
| Framework | Next.js 14 (web), Express (api) |
| Database | PostgreSQL, MySQL |
| Testing | Vitest, Playwright |
| Build | Turborepo |
| Deployment | Vercel |
| CI/CD | GitHub Actions |
| Monitoring | Custom pipeline monitor |
| AI | Brain/Memory/Nerve agents |

## Design Decisions

1. **No Kafka dependency** — CDC engine handles replication directly
2. **Connector-first architecture** — All data sources are connectors
3. **Event-driven** — UnifiedChangeEvent is the core data structure
4. **Checkpoint-based** — Resume from last known good state
5. **AI-native** — Schema mapping and prioritization via AI agents
6. **Monorepo** — Single codebase for all packages
7. **TypeScript** — Type safety across the stack
