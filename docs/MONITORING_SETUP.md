# PULSYN — MONITORING SETUP (GRAFANA CLOUD)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Pulsyn API    │────▶│   Prometheus    │────▶│  Grafana Cloud  │
│   (metrics)     │     │   (scrape)      │     │   (dashboard)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Metrics to Track

### Pipeline Metrics
- `pipeline_latency_ms` — End-to-end latency
- `pipeline_throughput_rows_per_sec` — Rows processed per second
- `pipeline_errors_total` — Total errors
- `pipeline_rows_synced_total` — Total rows synced
- `pipeline_bytes_synced_total` — Total bytes synced
- `pipeline_health_score` — Health score (0-100)

### Connector Metrics
- `connector_connection_status` — Connection status (0/1)
- `connector_test_duration_ms` — Test duration
- `connector_tables_discovered` — Tables discovered

### System Metrics
- `api_request_duration_ms` — API request duration
- `api_request_total` — Total API requests
- `api_error_total` — Total API errors
- `database_connection_pool_size` — DB connection pool
- `database_query_duration_ms` — DB query duration

## Grafana Dashboard Setup

### Step 1: Create Grafana Cloud Account
1. Go to https://grafana.com/products/cloud/
2. Create free account
3. Create a stack (e.g., pulsyn.grafana.net)

### Step 2: Add Prometheus Data Source
1. Go to Configuration → Data Sources
2. Add Prometheus
3. Use Grafana Cloud's hosted Prometheus endpoint

### Step 3: Install Prometheus Client
```bash
cd C:\Users\onein\pulsyn\packages\api
npm install prom-client
```

### Step 4: Add Metrics Endpoint
```typescript
// packages/api/src/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

const register = new Registry();

export const pipelineLatency = new Histogram({
  name: 'pipeline_latency_ms',
  help: 'End-to-end pipeline latency in milliseconds',
  buckets: [10, 50, 100, 500, 1000, 5000],
  registers: [register],
});

export const pipelineThroughput = new Counter({
  name: 'pipeline_throughput_rows_total',
  help: 'Total rows processed',
  registers: [register],
});

export const pipelineErrors = new Counter({
  name: 'pipeline_errors_total',
  help: 'Total pipeline errors',
  labelNames: ['pipeline_id', 'error_type'],
  registers: [register],
});

export const connectorStatus = new Gauge({
  name: 'connector_connection_status',
  help: 'Connector connection status (0/1)',
  labelNames: ['connector_id', 'connector_name'],
  registers: [register],
});

export const apiRequestDuration = new Histogram({
  name: 'api_request_duration_ms',
  help: 'API request duration in milliseconds',
  buckets: [10, 50, 100, 500, 1000],
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export { register };
```

### Step 5: Create Dashboard JSON
```json
{
  "dashboard": {
    "title": "Pulsyn Monitoring",
    "panels": [
      {
        "title": "Pipeline Latency",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, pipeline_latency_ms)",
            "legendFormat": "p95"
          }
        ]
      },
      {
        "title": "Throughput",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(pipeline_throughput_rows_total[5m])",
            "legendFormat": "rows/sec"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(pipeline_errors_total[5m])",
            "legendFormat": "errors/sec"
          }
        ]
      },
      {
        "title": "Connector Status",
        "type": "table",
        "targets": [
          {
            "expr": "connector_connection_status",
            "legendFormat": "{{connector_name}}"
          }
        ]
      }
    ]
  }
}
```

## Quick Setup (Grafana Cloud Free)

```bash
# 1. Sign up at grafana.com
# 2. Create stack
# 3. Get API key
# 4. Add to Vercel env vars
echo "YOUR_GRAFANA_API_KEY" | vercel env add GRAFANA_API_KEY production --scope 1inai

# 5. Deploy
cd C:\Users\onein\pulsyn\packages\web
vercel --prod --yes
```

## Alerting

### Latency Alert
- Condition: `pipeline_latency_ms > 5000`
- Action: Email + Slack notification

### Error Rate Alert
- Condition: `rate(pipeline_errors_total[5m]) > 0.01`
- Action: Email + Slack notification

### Connector Down Alert
- Condition: `connector_connection_status == 0`
- Action: Email + Slack notification

## Cost

| Tier | Metrics | Price |
|------|---------|-------|
| Free | 10K metrics | $0 |
| Pro | 100K metrics | $29/mo |
| Advanced | 1M metrics | $99/mo |

**Recommendation:** Start with Free tier, upgrade when needed.
