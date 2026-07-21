# Pulsyn — Developer Getting Started Guide

> The AI-Native CDC Platform — Real-time change data capture without the complexity.

---

## Quick Start

### 1. Install the CLI

```bash
npm install -g @pulsyn/cli
```

### 2. Configure your server

```bash
pulsyn config set server http://localhost:8080
pulsyn config set api-key YOUR_API_KEY
```

### 3. Create your first pipeline

```bash
# Create source connector
pulsyn connector create \
  --name "Source DB" \
  --engine postgresql \
  --host source-db.example.com \
  --port 5432 \
  --database production \
  --user replicator \
  --password secret

# Create target connector
pulsyn connector create \
  --name "Target DB" \
  --engine postgresql \
  --host target-db.example.com \
  --port 5432 \
  --database warehouse \
  --user writer \
  --password secret

# Create pipeline
pulsyn pipeline create \
  --name "users-replication" \
  --source-host source-db.example.com \
  --source-port 5432 \
  --source-db production \
  --source-user replicator \
  --source-password secret \
  --target-host target-db.example.com \
  --target-port 5432 \
  --target-db warehouse \
  --target-user writer \
  --target-password secret \
  --tables public.users public.orders

# Start replication
pulsyn pipeline start <pipeline-id>
```

---

## Authentication

All API endpoints (except health) require an API key passed as a Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

Get your API key from the [Pulsyn Dashboard](https://app.pulsyn.io/settings/api-keys).

### CLI Authentication

```bash
pulsyn config set api-key YOUR_API_KEY
```

### API Authentication

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.pulsyn.io/api/pipelines
```

### MCP Authentication

Set environment variables:

```bash
export PULSYN_API_URL=https://api.pulsyn.io
export PULSYN_API_KEY=YOUR_API_KEY
```

---

## API Reference

**Base URL:** `https://api.pulsyn.io` (or `http://localhost:8080` for local dev)

**Interactive Docs:** `http://localhost:8080/api/docs` (Swagger UI)

**OpenAPI Spec:** `http://localhost:8080/api/openapi.json`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |
| GET | `/api/health/ready` | Readiness check (includes dependency status) |

### Pipelines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pipelines` | List all pipelines |
| POST | `/api/pipelines` | Create a pipeline |
| GET | `/api/pipelines/:id` | Get pipeline details |
| PUT | `/api/pipelines/:id` | Update pipeline config |
| DELETE | `/api/pipelines/:id` | Delete a pipeline |
| POST | `/api/pipelines/:id/start` | Start replication |
| POST | `/api/pipelines/:id/stop` | Stop replication |
| POST | `/api/pipelines/:id/pause` | Pause replication |
| GET | `/api/pipelines/:id/metrics` | Get real-time metrics |
| GET | `/api/pipelines/:id/checkpoints` | Get checkpoint history |

### Connectors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/connectors` | List all connectors |
| POST | `/api/connectors` | Create a connector |
| GET | `/api/connectors/:id` | Get connector details |
| DELETE | `/api/connectors/:id` | Delete a connector |
| POST | `/api/connectors/:id/test` | Test connection |
| GET | `/api/connectors/:id/tables` | List tables |
| GET | `/api/connectors/:id/tables/:table/schema` | Get table schema |

---

## Code Examples

### cURL

```bash
# Health check
curl http://localhost:8080/api/health

# List pipelines
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/api/pipelines

# Create a pipeline
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "users-sync",
    "source": {
      "host": "source-db.example.com",
      "port": 5432,
      "database": "production",
      "user": "replicator",
      "password": "secret",
      "engine": "postgresql"
    },
    "target": {
      "host": "target-db.example.com",
      "port": 5432,
      "database": "warehouse",
      "user": "writer",
      "password": "secret",
      "engine": "postgresql"
    },
    "tables": ["public.users", "public.orders"]
  }' \
  http://localhost:8080/api/pipelines

# Start replication
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/api/pipelines/pipeline-1721606400000/start

# Get metrics
curl -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:8080/api/pipelines/pipeline-1721606400000/metrics
```

### Python

```python
import requests

BASE_URL = "http://localhost:8080"
HEADERS = {"Authorization": "Bearer YOUR_API_KEY"}

# List pipelines
response = requests.get(f"{BASE_URL}/api/pipelines", headers=HEADERS)
pipelines = response.json()
print(f"Found {pipelines['total']} pipelines")

# Create a pipeline
pipeline = requests.post(f"{BASE_URL}/api/pipelines", headers=HEADERS, json={
    "name": "users-sync",
    "source": {
        "host": "source-db.example.com",
        "port": 5432,
        "database": "production",
        "user": "replicator",
        "password": "secret",
        "engine": "postgresql",
    },
    "target": {
        "host": "target-db.example.com",
        "port": 5432,
        "database": "warehouse",
        "user": "writer",
        "password": "secret",
        "engine": "postgresql",
    },
    "tables": ["public.users", "public.orders"],
}).json()

print(f"Created pipeline: {pipeline['data']['id']}")

# Start replication
requests.post(
    f"{BASE_URL}/api/pipelines/{pipeline['data']['id']}/start",
    headers=HEADERS,
)

# Monitor metrics
import time
while True:
    metrics = requests.get(
        f"{BASE_URL}/api/pipelines/{pipeline['data']['id']}/metrics",
        headers=HEADERS,
    ).json()
    stats = metrics["data"]["stats"]
    print(f"Rows/s: {stats['rowsPerSecond']}, Lag: {stats['lagMs']}ms")
    time.sleep(5)
```

### JavaScript / TypeScript

```typescript
const BASE_URL = "http://localhost:8080";
const HEADERS = {
  Authorization: "Bearer YOUR_API_KEY",
  "Content-Type": "application/json",
};

// List pipelines
const listRes = await fetch(`${BASE_URL}/api/pipelines`, { headers: HEADERS });
const { data: pipelines, total } = await listRes.json();
console.log(`Found ${total} pipelines`);

// Create a pipeline
const createRes = await fetch(`${BASE_URL}/api/pipelines`, {
  method: "POST",
  headers: HEADERS,
  body: JSON.stringify({
    name: "users-sync",
    source: {
      host: "source-db.example.com",
      port: 5432,
      database: "production",
      user: "replicator",
      password: "secret",
    },
    target: {
      host: "target-db.example.com",
      port: 5432,
      database: "warehouse",
      user: "writer",
      password: "secret",
    },
    tables: ["public.users", "public.orders"],
  }),
});
const { data: pipeline } = await createRes.json();
console.log(`Created pipeline: ${pipeline.id}`);

// Start replication
await fetch(`${BASE_URL}/api/pipelines/${pipeline.id}/start`, {
  method: "POST",
  headers: HEADERS,
});

// Poll metrics
setInterval(async () => {
  const metricsRes = await fetch(
    `${BASE_URL}/api/pipelines/${pipeline.id}/metrics`,
    { headers: HEADERS }
  );
  const { data } = await metricsRes.json();
  console.log(`Rows/s: ${data.stats.rowsPerSecond}, Lag: ${data.stats.lagMs}ms`);
}, 5000);
```

### Pulsyn SDK (TypeScript)

```typescript
import { PulsynApiClient } from "@pulsyn/core";

const client = new PulsynApiClient({
  baseUrl: "http://localhost:8080",
  apiKey: "YOUR_API_KEY",
});

// List pipelines
const { data: pipelines } = await client.listPipelines();

// Create a pipeline
const { data: pipeline } = await client.createPipeline({
  name: "users-sync",
  source: {
    host: "source-db.example.com",
    port: 5432,
    database: "production",
    user: "replicator",
    password: "secret",
  },
  target: {
    host: "target-db.example.com",
    port: 5432,
    database: "warehouse",
    user: "writer",
    password: "secret",
  },
  tables: ["public.users", "public.orders"],
});

// Start replication
await client.startPipeline(pipeline.id);

// Get metrics
const { data: metrics } = await client.getPipelineMetrics(pipeline.id);
console.log(`Rows/s: ${metrics.stats.rowsPerSecond}`);
```

---

## CLI Reference

### Configuration

```bash
pulsyn config show              # Show current config
pulsyn config set server URL    # Set API server URL
pulsyn config set api-key KEY   # Set API key
pulsyn config set format json   # Set output format (table|json)
```

### Pipelines

```bash
pulsyn pipeline list                    # List all pipelines
pulsyn pipeline get <id>                # Get pipeline details
pulsyn pipeline create [options]        # Create a pipeline
pulsyn pipeline start <id>              # Start replication
pulsyn pipeline stop <id>               # Stop replication
pulsyn pipeline pause <id>              # Pause replication
pulsyn pipeline delete <id>             # Delete a pipeline
pulsyn pipeline metrics <id>            # Get metrics
pulsyn pipeline checkpoints <id>        # Get checkpoints
```

### Connectors

```bash
pulsyn connector list                   # List all connectors
pulsyn connector create [options]       # Create a connector
pulsyn connector test <id>              # Test connection
pulsyn connector tables <id>            # List tables
pulsyn connector schema <id> <table>    # Get table schema
pulsyn connector delete <id>            # Delete a connector
```

### Replication

```bash
pulsyn replication start <pipeline-id>  # Start replication
pulsyn replication stop <pipeline-id>   # Stop replication
pulsyn replication status               # Show all active replications
```

### System

```bash
pulsyn health                           # Check server health
pulsyn init                             # Initialize project config
pulsyn benchmark [options]              # Run performance benchmarks
pulsyn export [options]                 # Export pipeline config
```

### Global Options

```bash
-s, --server <url>    Override API server URL
-k, --api-key <key>   Override API key
-j, --json            Output as JSON instead of table
```

---

## MCP Integration

Pulsyn provides an MCP (Model Context Protocol) server for AI agent integration.

### Setup

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "pulsyn": {
      "command": "node",
      "args": ["path/to/@pulsyn/mcp/dist/index.js"],
      "env": {
        "PULSYN_API_URL": "http://localhost:8080",
        "PULSYN_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Available Tools

| Tool | Description |
|------|-------------|
| `pulsyn.health` | Check API server health |
| `pulsyn.pipeline.list` | List all pipelines |
| `pulsyn.pipeline.get` | Get pipeline details |
| `pulsyn.pipeline.create` | Create a new pipeline |
| `pulsyn.pipeline.start` | Start a pipeline |
| `pulsyn.pipeline.stop` | Stop a pipeline |
| `pulsyn.pipeline.pause` | Pause a pipeline |
| `pulsyn.pipeline.delete` | Delete a pipeline |
| `pulsyn.pipeline.metrics` | Get pipeline metrics |
| `pulsyn.pipeline.checkpoints` | Get checkpoint history |
| `pulsyn.connector.list` | List connectors |
| `pulsyn.connector.create` | Create a connector |
| `pulsyn.connector.test` | Test connection |
| `pulsyn.connector.tables` | List tables |
| `pulsyn.connector.schema` | Get table schema |
| `pulsyn.connector.delete` | Delete a connector |

### Example AI Prompts

```
"List all my Pulsyn pipelines"
"Create a pipeline from my PostgreSQL production database to the warehouse"
"Show me the metrics for pipeline-123"
"Test the connection to my MySQL database"
"What tables are available in connector-456?"
```

---

## Error Handling

All errors return a consistent format:

```json
{
  "error": "Human-readable error message",
  "status": 404
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request — check your input |
| 401 | Unauthorized — check your API key |
| 404 | Not found — check the resource ID |
| 409 | Conflict — e.g., pipeline already running |
| 500 | Server error — contact support |

---

## Rate Limits

| Tier | Requests/min | Rows/day | Price |
|------|-------------|----------|-------|
| Free | 60 | 10,000 | $0 |
| Standard | 600 | 100,000 | $99/mo |
| Business | 6,000 | 1,000,000 | $499/mo |
| Enterprise | 60,000 | 100,000,000 | $2,499/mo |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 600
X-RateLimit-Remaining: 599
X-RateLimit-Reset: 1721606460
```

---

## Support

- **Documentation:** [pulsyn.io/docs](https://pulsyn.io/docs)
- **API Status:** [status.pulsyn.io](https://status.pulsyn.io)
- **Email:** support@pulsyn.io
- **GitHub:** [github.com/tinkss9/pulsyn](https://github.com/tinkss9/pulsyn)
