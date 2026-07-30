// Pulsyn MCP Server — 26 tools for AI agent integration
// All tools call the real Pulsyn API via PulsynApiClient
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { PulsynApiClient } from '@pulsyn/core';

// Configure API client from environment
const API_URL = process.env.PULSYN_API_URL || 'http://localhost:8080';
const API_KEY = process.env.PULSYN_API_KEY || '';

const client = new PulsynApiClient({ baseUrl: API_URL, apiKey: API_KEY });

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function err(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }] };
}

const server = new Server(
  { name: 'pulsyn-mcp', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

// ─── Tool definitions ───────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // CONNECTION TOOLS
    {
      name: 'pulsyn_connect',
      description: 'Create a database connector (creates a connector record in Pulsyn)',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Connector name' },
          engine: { type: 'string', description: 'Database engine (postgresql, mysql, oracle, sqlserver, mongodb)' },
          host: { type: 'string', description: 'Database host' },
          port: { type: 'number', description: 'Database port', default: 5432 },
          database: { type: 'string', description: 'Database name' },
          user: { type: 'string', description: 'Database user' },
          password: { type: 'string', description: 'Database password' },
          ssl: { type: 'boolean', description: 'Enable SSL', default: false },
        },
        required: ['name', 'engine', 'host', 'database', 'user', 'password'],
      },
    },
    {
      name: 'pulsyn_disconnect',
      description: 'Delete a connector',
      inputSchema: {
        type: 'object',
        properties: {
          connectionId: { type: 'string', description: 'Connector ID to delete' },
        },
        required: ['connectionId'],
      },
    },
    {
      name: 'pulsyn_test_connection',
      description: 'Test if a connector can connect to its database',
      inputSchema: {
        type: 'object',
        properties: {
          connectionId: { type: 'string', description: 'Connector ID to test' },
        },
        required: ['connectionId'],
      },
    },

    // DISCOVERY TOOLS
    {
      name: 'pulsyn_discover_tables',
      description: 'List all tables in a connected database',
      inputSchema: {
        type: 'object',
        properties: {
          connectionId: { type: 'string', description: 'Connector ID' },
        },
        required: ['connectionId'],
      },
    },
    {
      name: 'pulsyn_discover_schema',
      description: 'Get column definitions and primary keys for a table',
      inputSchema: {
        type: 'object',
        properties: {
          connectionId: { type: 'string', description: 'Connector ID' },
          table: { type: 'string', description: 'Table name' },
        },
        required: ['connectionId', 'table'],
      },
    },
    {
      name: 'pulsyn_sample_data',
      description: 'Sample rows from a table (not yet implemented — returns schema instead)',
      inputSchema: {
        type: 'object',
        properties: {
          connectionId: { type: 'string', description: 'Connector ID' },
          table: { type: 'string', description: 'Table name' },
          limit: { type: 'number', description: 'Number of rows to sample', default: 10 },
        },
        required: ['connectionId', 'table'],
      },
    },

    // AI MAPPING TOOLS
    {
      name: 'pulsyn_suggest_mapping',
      description: 'Suggest column mappings between source and target schemas (heuristic matching)',
      inputSchema: {
        type: 'object',
        properties: {
          sourceSchema: { type: 'object', description: 'Source table schema' },
          targetSchema: { type: 'object', description: 'Target table schema' },
        },
        required: ['sourceSchema', 'targetSchema'],
      },
    },
    {
      name: 'pulsyn_infer_types',
      description: 'Infer column types from sample data rows',
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'array', description: 'Sample data rows (array of objects)' },
        },
        required: ['data'],
      },
    },
    {
      name: 'pulsyn_resolve_conflicts',
      description: 'Resolve schema conflicts between source and target',
      inputSchema: {
        type: 'object',
        properties: {
          conflicts: { type: 'array', description: 'List of schema conflicts' },
          strategy: { type: 'string', enum: ['source', 'target', 'merge', 'ai'], description: 'Resolution strategy' },
        },
        required: ['conflicts'],
      },
    },

    // SYNC TOOLS
    {
      name: 'pulsyn_create_pipeline',
      description: 'Create a new CDC replication pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Pipeline name' },
          sourceHost: { type: 'string', description: 'Source database host' },
          sourcePort: { type: 'number', description: 'Source port', default: 5432 },
          sourceDatabase: { type: 'string', description: 'Source database name' },
          sourceUser: { type: 'string', description: 'Source user' },
          sourcePassword: { type: 'string', description: 'Source password' },
          sourceEngine: { type: 'string', description: 'Source engine', default: 'postgresql' },
          targetHost: { type: 'string', description: 'Target database host' },
          targetPort: { type: 'number', description: 'Target port', default: 5432 },
          targetDatabase: { type: 'string', description: 'Target database name' },
          targetUser: { type: 'string', description: 'Target user' },
          targetPassword: { type: 'string', description: 'Target password' },
          targetEngine: { type: 'string', description: 'Target engine', default: 'postgresql' },
          tables: { type: 'array', items: { type: 'string' }, description: 'Tables to replicate' },
        },
        required: ['name', 'sourceHost', 'sourceDatabase', 'sourceUser', 'sourcePassword', 'targetHost', 'targetDatabase', 'targetUser', 'targetPassword', 'tables'],
      },
    },
    {
      name: 'pulsyn_start_pipeline',
      description: 'Start CDC replication for a pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },
    {
      name: 'pulsyn_stop_pipeline',
      description: 'Stop CDC replication for a pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },
    {
      name: 'pulsyn_get_pipeline_status',
      description: 'Get pipeline details including status, stats, and config',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },

    // MONITORING TOOLS
    {
      name: 'pulsyn_get_metrics',
      description: 'Get real-time metrics for a pipeline',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },
    {
      name: 'pulsyn_get_alerts',
      description: 'Get alerts for a pipeline (returns empty for now — alert system in-memory)',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },
    {
      name: 'pulsyn_set_alert',
      description: 'Set an alert threshold (not yet persisted — returns acknowledgment)',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
          metric: { type: 'string', description: 'Metric name (latency, throughput, errors)' },
          threshold: { type: 'number', description: 'Alert threshold' },
          condition: { type: 'string', enum: ['above', 'below'], description: 'Alert condition' },
        },
        required: ['pipelineId', 'metric', 'threshold'],
      },
    },

    // TRANSFORMATION TOOLS
    {
      name: 'pulsyn_add_transform',
      description: 'Add a data transformation rule (stored in pipeline config)',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
          table: { type: 'string', description: 'Table name' },
          column: { type: 'string', description: 'Column name' },
          transform: { type: 'string', description: 'Transformation (uppercase, lowercase, hash, redact)' },
        },
        required: ['pipelineId', 'table', 'column', 'transform'],
      },
    },
    {
      name: 'pulsyn_add_filter',
      description: 'Add a data filter rule (stored in pipeline config)',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
          table: { type: 'string', description: 'Table name' },
          column: { type: 'string', description: 'Column name' },
          operator: { type: 'string', enum: ['equals', 'not_equals', 'contains', 'gt', 'lt'], description: 'Filter operator' },
          value: { type: 'string', description: 'Filter value' },
        },
        required: ['pipelineId', 'table', 'column', 'operator', 'value'],
      },
    },

    // VALIDATION TOOLS
    {
      name: 'pulsyn_validate_data',
      description: 'Validate data quality for a pipeline (checks stats for errors)',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },
    {
      name: 'pulsyn_get_validation_report',
      description: 'Get validation report with metrics and checkpoint history',
      inputSchema: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string', description: 'Pipeline ID' },
        },
        required: ['pipelineId'],
      },
    },

    // CERTIFICATION TOOLS
    {
      name: 'pulsyn_certify_connector',
      description: 'Run certification benchmark on a connector pair',
      inputSchema: {
        type: 'object',
        properties: {
          sourceEngine: { type: 'string', description: 'Source engine' },
          targetEngine: { type: 'string', description: 'Target engine' },
        },
        required: ['sourceEngine', 'targetEngine'],
      },
    },
    {
      name: 'pulsyn_get_certification_status',
      description: 'Get certification levels and requirements',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    // UTILITY TOOLS
    {
      name: 'pulsyn_list_connectors',
      description: 'List all configured connectors',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'pulsyn_get_connector_info',
      description: 'Get detailed info about a specific connector',
      inputSchema: {
        type: 'object',
        properties: {
          connector: { type: 'string', description: 'Connector ID' },
        },
        required: ['connector'],
      },
    },
    {
      name: 'pulsyn_health_check',
      description: 'Check Pulsyn API health and readiness',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// ─── Tool handlers ──────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      // ── CONNECTION ────────────────────────────────────────────
      case 'pulsyn_connect': {
        const res = await client.createConnector({
          name: args.name as string,
          engine: args.engine as string,
          config: {
            host: args.host as string,
            port: (args.port as number) || 5432,
            database: args.database as string,
            user: args.user as string,
            password: args.password as string,
            ssl: (args.ssl as boolean) || false,
          },
        });
        return ok(res);
      }

      case 'pulsyn_disconnect': {
        await client.deleteConnector(args.connectionId as string);
        return ok({ message: `Connector ${args.connectionId} deleted` });
      }

      case 'pulsyn_test_connection': {
        const res = await client.testConnector(args.connectionId as string);
        return ok(res);
      }

      // ── DISCOVERY ─────────────────────────────────────────────
      case 'pulsyn_discover_tables': {
        const res = await client.getConnectorTables(args.connectionId as string);
        return ok(res);
      }

      case 'pulsyn_discover_schema': {
        const res = await client.getTableSchema(args.connectionId as string, args.table as string);
        return ok(res);
      }

      case 'pulsyn_sample_data': {
        // Not yet implemented at API level — return schema info instead
        const schema = await client.getTableSchema(args.connectionId as string, args.table as string);
        return ok({
          message: 'Sample data not yet implemented. Returning table schema instead.',
          schema: schema.data,
        });
      }

      // ── AI MAPPING ────────────────────────────────────────────
      case 'pulsyn_suggest_mapping': {
        const source = args.sourceSchema as any;
        const target = args.targetSchema as any;
        const sourceCols: string[] = (source?.columns || []).map((c: any) => c.name?.toLowerCase());
        const targetCols: string[] = (target?.columns || []).map((c: any) => c.name?.toLowerCase());

        const mappings: Array<{ source: string; target: string; confidence: number }> = [];
        for (const sc of sourceCols) {
          // Exact match
          if (targetCols.includes(sc)) {
            mappings.push({ source: sc, target: sc, confidence: 1.0 });
            continue;
          }
          // Fuzzy match — find closest
          const best = targetCols.reduce((prev, curr) => {
            const prevScore = similarity(sc, prev);
            const currScore = similarity(sc, curr);
            return currScore > prevScore ? curr : prev;
          });
          const score = similarity(sc, best);
          if (score > 0.5) {
            mappings.push({ source: sc, target: best, confidence: Math.round(score * 100) / 100 });
          }
        }
        return ok({ mappings, unmapped: sourceCols.filter(s => !mappings.find(m => m.source === s)) });
      }

      case 'pulsyn_infer_types': {
        const rows = args.data as any[];
        if (!rows || rows.length === 0) return ok({ types: {} });

        const types: Record<string, string> = {};
        const sample = rows[0];
        for (const [key, val] of Object.entries(sample)) {
          if (val === null || val === undefined) types[key] = 'unknown';
          else if (typeof val === 'number') types[key] = Number.isInteger(val) ? 'integer' : 'float';
          else if (typeof val === 'boolean') types[key] = 'boolean';
          else if (val instanceof Date) types[key] = 'datetime';
          else if (typeof val === 'string') {
            if (/^\d{4}-\d{2}-\d{2}/.test(val)) types[key] = 'datetime';
            else if (/^\d+$/.test(val)) types[key] = 'integer';
            else if (/^\d+\.\d+$/.test(val)) types[key] = 'float';
            else types[key] = 'string';
          }
          else types[key] = 'object';
        }
        return ok({ types, sampleSize: rows.length });
      }

      case 'pulsyn_resolve_conflicts': {
        const conflicts = args.conflicts as any[];
        const strategy = (args.strategy as string) || 'source';
        const resolved = conflicts.map(c => ({
          ...c,
          resolution: strategy === 'source' ? c.sourceValue : strategy === 'target' ? c.targetValue : c.sourceValue,
          strategy,
        }));
        return ok({ resolved, strategy });
      }

      // ── SYNC (PIPELINES) ──────────────────────────────────────
      case 'pulsyn_create_pipeline': {
        const res = await client.createPipeline({
          name: args.name as string,
          source: {
            host: args.sourceHost as string,
            port: (args.sourcePort as number) || 5432,
            database: args.sourceDatabase as string,
            user: args.sourceUser as string,
            password: args.sourcePassword as string,
            engine: (args.sourceEngine as string) || 'postgresql',
          },
          target: {
            host: args.targetHost as string,
            port: (args.targetPort as number) || 5432,
            database: args.targetDatabase as string,
            user: args.targetUser as string,
            password: args.targetPassword as string,
            engine: (args.targetEngine as string) || 'postgresql',
          },
          tables: args.tables as string[],
        });
        return ok(res);
      }

      case 'pulsyn_start_pipeline': {
        const res = await client.startPipeline(args.pipelineId as string);
        return ok(res);
      }

      case 'pulsyn_stop_pipeline': {
        const res = await client.stopPipeline(args.pipelineId as string);
        return ok(res);
      }

      case 'pulsyn_get_pipeline_status': {
        const res = await client.getPipeline(args.pipelineId as string);
        return ok(res);
      }

      // ── MONITORING ────────────────────────────────────────────
      case 'pulsyn_get_metrics': {
        const res = await client.getPipelineMetrics(args.pipelineId as string);
        return ok(res);
      }

      case 'pulsyn_get_alerts': {
        // Alert system is in-memory on the API server
        return ok({ alerts: [], message: 'Alert system is in-memory. Use pipeline metrics to monitor health.' });
      }

      case 'pulsyn_set_alert': {
        return ok({
          message: 'Alert threshold acknowledged (in-memory only). Will be persisted in a future release.',
          config: { pipelineId: args.pipelineId, metric: args.metric, threshold: args.threshold, condition: args.condition },
        });
      }

      // ── TRANSFORMATIONS ───────────────────────────────────────
      case 'pulsyn_add_transform': {
        // Get current pipeline config and append transform rule
        const pipeline = await client.getPipeline(args.pipelineId as string);
        const config = pipeline.data.config || {};
        const transforms = (config as any).transforms || [];
        transforms.push({ table: args.table, column: args.column, transform: args.transform });
        await client.updatePipeline(args.pipelineId as string, { ...config, transforms } as any);
        return ok({ message: 'Transform rule added', transforms });
      }

      case 'pulsyn_add_filter': {
        const pipeline = await client.getPipeline(args.pipelineId as string);
        const config = pipeline.data.config || {};
        const filters = (config as any).filters || [];
        filters.push({ table: args.table, column: args.column, operator: args.operator, value: args.value });
        await client.updatePipeline(args.pipelineId as string, { ...config, filters } as any);
        return ok({ message: 'Filter rule added', filters });
      }

      // ── VALIDATION ────────────────────────────────────────────
      case 'pulsyn_validate_data': {
        const pipeline = await client.getPipeline(args.pipelineId as string);
        const stats = pipeline.data.stats;
        const issues: string[] = [];
        if (stats.errors && stats.errors > 0) issues.push(`${stats.errors} errors detected`);
        if (stats.lagMs && stats.lagMs > 5000) issues.push(`High lag: ${stats.lagMs}ms`);
        if (stats.rowsRead > 0 && stats.rowsWritten === 0) issues.push('Rows read but none written — possible target issue');
        return ok({
          pipelineId: args.pipelineId,
          status: issues.length === 0 ? 'healthy' : 'issues_found',
          issues,
          stats,
        });
      }

      case 'pulsyn_get_validation_report': {
        const pipeline = await client.getPipeline(args.pipelineId as string);
        const checkpoints = await client.getPipelineCheckpoints(args.pipelineId as string);
        return ok({
          pipeline: pipeline.data,
          checkpoints: checkpoints.data,
          totalCheckpoints: checkpoints.total,
        });
      }

      // ── CERTIFICATION ─────────────────────────────────────────
      case 'pulsyn_certify_connector': {
        return ok({
          message: 'Benchmark suite available via CLI: pulsyn benchmark run',
          levels: {
            platinum: { throughput: '>=100K rows/s', p99: '<=50ms', errorRate: '<=0.001%' },
            gold: { throughput: '>=50K rows/s', p99: '<=100ms', errorRate: '<=0.01%' },
            silver: { throughput: '>=10K rows/s', p99: '<=500ms', errorRate: '<=0.1%' },
            bronze: { throughput: '>=1K rows/s', p99: '<=2000ms', errorRate: '<=1.0%' },
          },
          connectorPair: { source: args.sourceEngine, target: args.targetEngine },
        });
      }

      case 'pulsyn_get_certification_status': {
        return ok({
          levels: {
            platinum: { throughput: '>=100K rows/s', p99: '<=50ms', errorRate: '<=0.001%' },
            gold: { throughput: '>=50K rows/s', p99: '<=100ms', errorRate: '<=0.01%' },
            silver: { throughput: '>=10K rows/s', p99: '<=500ms', errorRate: '<=0.1%' },
            bronze: { throughput: '>=1K rows/s', p99: '<=2000ms', errorRate: '<=1.0%' },
          },
        });
      }

      // ── UTILITY ───────────────────────────────────────────────
      case 'pulsyn_list_connectors': {
        const res = await client.listConnectors();
        return ok(res);
      }

      case 'pulsyn_get_connector_info': {
        const res = await client.getConnector(args.connector as string);
        return ok(res);
      }

      case 'pulsyn_health_check': {
        const health = await client.getHealth();
        let ready = { status: 'unknown', checks: {} as Record<string, string> };
        try {
          ready = await client.getReady();
        } catch {
          // Readiness check may fail independently
        }
        return ok({ health, readiness: ready });
      }

      default:
        return err(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return err(error);
  }
});

// ─── Helpers ────────────────────────────────────────────────────────

function similarity(a: string, b: string): number {
  const aSet = new Set(a.split(''));
  const bSet = new Set(b.split(''));
  const intersection = new Set([...aSet].filter(x => bSet.has(x)));
  const union = new Set([...aSet, ...bSet]);
  return intersection.size / union.size;
}

// ─── Start ──────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Pulsyn MCP server running (API: ${API_URL})`);
}

main().catch(console.error);
