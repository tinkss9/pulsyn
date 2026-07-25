// Pulsyn MCP Server
// AI agent integration via Model Context Protocol

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PulsynApiClient, ApiError, VERSION } from '@pulsyn/core';

// Configuration from environment
const API_URL = process.env.PULSYN_API_URL || 'http://localhost:8080';
const API_KEY = process.env.PULSYN_API_KEY;

const client = new PulsynApiClient({
  baseUrl: API_URL,
  apiKey: API_KEY,
});

// Billing API helper (direct HTTP since billing endpoints aren't in the SDK yet)
async function billingRequest(method: string, path: string, body?: unknown): Promise<any> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined;
  return res.json();
}

// Tool definitions
const TOOLS = [
  {
    name: 'pulsyn.health',
    description: 'Check Pulsyn API server health and status',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.pipeline.list',
    description: 'List all replication pipelines with their current status and metrics',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.pipeline.get',
    description: 'Get detailed information about a specific pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.create',
    description: 'Create a new replication pipeline between source and target databases',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Pipeline name' },
        source: {
          type: 'object',
          properties: {
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
            engine: { type: 'string', description: 'postgresql, mysql, oracle, sqlserver, mongodb' },
          },
          required: ['host', 'port', 'database', 'user', 'password'],
        },
        target: {
          type: 'object',
          properties: {
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
            engine: { type: 'string' },
          },
          required: ['host', 'port', 'database', 'user', 'password'],
        },
        tables: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tables to replicate (e.g., ["public.users", "public.orders"])',
        },
      },
      required: ['name', 'source', 'target', 'tables'],
    },
  },
  {
    name: 'pulsyn.pipeline.start',
    description: 'Start a replication pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.stop',
    description: 'Stop a running replication pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.pause',
    description: 'Pause a running replication pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.delete',
    description: 'Delete a pipeline permanently',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.metrics',
    description: 'Get real-time metrics for a pipeline (rows/s, lag, errors)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.pipeline.checkpoints',
    description: 'Get checkpoint history for a pipeline (resumability audit)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.connector.list',
    description: 'List all configured database connectors',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.connector.create',
    description: 'Create a new database connector',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Connector name' },
        engine: { type: 'string', description: 'Database engine (postgresql, mysql, oracle, sqlserver, mongodb)' },
        config: {
          type: 'object',
          properties: {
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
            ssl: { type: 'boolean' },
          },
          required: ['host', 'port', 'database', 'user', 'password'],
        },
      },
      required: ['name', 'engine', 'config'],
    },
  },
  {
    name: 'pulsyn.connector.test',
    description: 'Test a database connection and measure latency',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectorId: { type: 'string', description: 'Connector ID' },
      },
      required: ['connectorId'],
    },
  },
  {
    name: 'pulsyn.connector.tables',
    description: 'List tables available in a connected database',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectorId: { type: 'string', description: 'Connector ID' },
      },
      required: ['connectorId'],
    },
  },
  {
    name: 'pulsyn.connector.schema',
    description: 'Get the schema (columns, types, keys) of a specific table',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectorId: { type: 'string', description: 'Connector ID' },
        table: { type: 'string', description: 'Table name' },
      },
      required: ['connectorId', 'table'],
    },
  },
  {
    name: 'pulsyn.connector.delete',
    description: 'Delete a connector permanently',
    inputSchema: {
      type: 'object' as const,
      properties: {
        connectorId: { type: 'string', description: 'Connector ID' },
      },
      required: ['connectorId'],
    },
  },
  // Billing tools
  {
    name: 'pulsyn.billing.plans',
    description: 'List available subscription plans with pricing and features',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.billing.status',
    description: 'Get subscription and usage status for an organization',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organizationId: { type: 'string', description: 'Organization ID', default: 'default' },
      },
    },
  },
  {
    name: 'pulsyn.billing.subscribe',
    description: 'Subscribe an organization to a plan',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organizationId: { type: 'string', description: 'Organization ID' },
        planId: { type: 'string', description: 'Plan ID (starter, business, enterprise)' },
        email: { type: 'string', description: 'Billing email' },
      },
      required: ['organizationId', 'planId', 'email'],
    },
  },
  {
    name: 'pulsyn.billing.usage',
    description: 'Get usage summary and limits for an organization',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organizationId: { type: 'string', description: 'Organization ID', default: 'default' },
      },
    },
  },
  {
    name: 'pulsyn.billing.record_usage',
    description: 'Record metered usage (rows replicated, API calls, etc.)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        organizationId: { type: 'string', description: 'Organization ID' },
        metric: {
          type: 'string',
          enum: ['rows_replicated', 'api_calls', 'pipeline_hours', 'storage_bytes'],
          description: 'Usage metric type',
        },
        quantity: { type: 'number', description: 'Usage quantity' },
      },
      required: ['organizationId', 'metric', 'quantity'],
    },
  },
  {
    name: 'pulsyn.billing.checkout',
    description: 'Create a Stripe checkout session for subscribing to a plan',
    inputSchema: {
      type: 'object' as const,
      properties: {
        planId: { type: 'string', description: 'Plan ID (starter, business, enterprise)' },
        email: { type: 'string', description: 'Customer email' },
        organizationId: { type: 'string', description: 'Organization ID' },
      },
      required: ['planId', 'email'],
    },
  },
  // Benchmark tools
  {
    name: 'pulsyn.benchmark.run',
    description: 'Run a connector benchmark to measure throughput, latency, and correctness',
    inputSchema: {
      type: 'object' as const,
      properties: {
        source: {
          type: 'object',
          properties: {
            engine: { type: 'string', description: 'Source engine (postgresql, mysql, etc.)' },
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['engine', 'host', 'database', 'user', 'password'],
        },
        target: {
          type: 'object',
          properties: {
            engine: { type: 'string' },
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['engine', 'host', 'database', 'user', 'password'],
        },
        totalRows: { type: 'number', description: 'Total rows to test', default: 100000 },
        durationSeconds: { type: 'number', description: 'Test duration in seconds', default: 10 },
      },
      required: ['source', 'target'],
    },
  },
  {
    name: 'pulsyn.benchmark.reports',
    description: 'List recent benchmark reports',
    inputSchema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max reports to return', default: 10 },
      },
    },
  },
  {
    name: 'pulsyn.benchmark.certification',
    description: 'Get certification level requirements (platinum, gold, silver, bronze)',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.benchmark.suites',
    description: 'List available benchmark test suites',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  // CDC tools
  {
    name: 'pulsyn.cdc.start',
    description: 'Start CDC (Change Data Capture) engine for a pipeline — begins real-time replication',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID to start CDC on' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.cdc.stop',
    description: 'Stop CDC engine for a pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID to stop CDC on' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.cdc.status',
    description: 'Get CDC engine status, stats, and pending changes for a pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
      },
      required: ['pipelineId'],
    },
  },
  {
    name: 'pulsyn.cdc.engines',
    description: 'List all active CDC engines across all pipelines',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'pulsyn.cdc.events',
    description: 'Get recent CDC events (INSERT/UPDATE/DELETE) for a pipeline',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pipelineId: { type: 'string', description: 'Pipeline ID' },
        limit: { type: 'number', description: 'Max events to return', default: 100 },
      },
      required: ['pipelineId'],
    },
  },
];

// Helper to format success responses
function successResponse(data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

// Helper to format error responses
function errorResponse(message: string, status?: number) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          error: message,
          status,
          api_url: API_URL,
        }, null, 2),
      },
    ],
    isError: true,
  };
}

// Create server
const server = new Server(
  {
    name: 'pulsyn',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Health
      case 'pulsyn.health': {
        const health = await client.getHealth();
        return successResponse(health);
      }

      // Pipeline operations
      case 'pulsyn.pipeline.list': {
        const res = await client.listPipelines();
        return successResponse({
          pipelines: res.data.map(p => ({
            id: p.id,
            name: p.config?.name,
            status: p.status,
            stats: p.stats,
          })),
          total: res.total,
        });
      }

      case 'pulsyn.pipeline.get': {
        const res = await client.getPipeline(args?.pipelineId as string);
        return successResponse(res.data);
      }

      case 'pulsyn.pipeline.create': {
        const res = await client.createPipeline({
          name: args?.name as string,
          source: args?.source as any,
          target: args?.target as any,
          tables: args?.tables as string[],
        });
        return successResponse({
          id: res.data.id,
          status: res.data.status,
          message: `Pipeline "${args?.name}" created successfully`,
        });
      }

      case 'pulsyn.pipeline.start': {
        const res = await client.startPipeline(args?.pipelineId as string);
        return successResponse({
          pipelineId: res.data.id,
          status: res.data.status,
          message: 'Pipeline started',
          startedAt: res.data.startedAt,
        });
      }

      case 'pulsyn.pipeline.stop': {
        const res = await client.stopPipeline(args?.pipelineId as string);
        return successResponse({
          pipelineId: res.data.id,
          status: res.data.status,
          message: 'Pipeline stopped',
        });
      }

      case 'pulsyn.pipeline.pause': {
        const res = await client.pausePipeline(args?.pipelineId as string);
        return successResponse({
          pipelineId: res.data.id,
          status: res.data.status,
          message: 'Pipeline paused',
        });
      }

      case 'pulsyn.pipeline.delete': {
        await client.deletePipeline(args?.pipelineId as string);
        return successResponse({
          pipelineId: args?.pipelineId,
          message: 'Pipeline deleted',
        });
      }

      case 'pulsyn.pipeline.metrics': {
        const res = await client.getPipelineMetrics(args?.pipelineId as string);
        return successResponse(res.data);
      }

      case 'pulsyn.pipeline.checkpoints': {
        const res = await client.getPipelineCheckpoints(args?.pipelineId as string);
        return successResponse({
          checkpoints: res.data,
          total: res.total,
        });
      }

      // Connector operations
      case 'pulsyn.connector.list': {
        const res = await client.listConnectors();
        return successResponse({
          connectors: res.data,
          total: res.total,
        });
      }

      case 'pulsyn.connector.create': {
        const res = await client.createConnector({
          name: args?.name as string,
          engine: args?.engine as string,
          config: args?.config as any,
        });
        return successResponse({
          id: res.data.id,
          name: res.data.name,
          engine: res.data.engine,
          status: res.data.status,
          message: `Connector "${args?.name}" created`,
        });
      }

      case 'pulsyn.connector.test': {
        const res = await client.testConnector(args?.connectorId as string);
        return successResponse(res.data);
      }

      case 'pulsyn.connector.tables': {
        const res = await client.getConnectorTables(args?.connectorId as string);
        return successResponse({
          tables: res.data,
          total: res.total,
        });
      }

      case 'pulsyn.connector.schema': {
        const res = await client.getTableSchema(
          args?.connectorId as string,
          args?.table as string
        );
        return successResponse(res.data);
      }

      case 'pulsyn.connector.delete': {
        await client.deleteConnector(args?.connectorId as string);
        return successResponse({
          connectorId: args?.connectorId,
          message: 'Connector deleted',
        });
      }

      // Billing operations
      case 'pulsyn.billing.plans': {
        const res = await billingRequest('GET', '/api/billing/plans');
        return successResponse(res);
      }

      case 'pulsyn.billing.status': {
        const orgId = (args?.organizationId as string) || 'default';
        const sub = await billingRequest('GET', `/api/billing/subscriptions/${orgId}`);
        const usage = await billingRequest('GET', `/api/billing/usage/${orgId}`);
        return successResponse({
          subscription: sub?.data || null,
          usage: usage?.data || null,
        });
      }

      case 'pulsyn.billing.subscribe': {
        const res = await billingRequest('POST', '/api/billing/subscriptions', {
          organizationId: args?.organizationId,
          planId: args?.planId,
          email: args?.email,
        });
        return successResponse(res);
      }

      case 'pulsyn.billing.usage': {
        const orgId = (args?.organizationId as string) || 'default';
        const res = await billingRequest('GET', `/api/billing/usage/${orgId}`);
        return successResponse(res?.data || res);
      }

      case 'pulsyn.billing.record_usage': {
        const res = await billingRequest('POST', '/api/billing/usage', {
          organizationId: args?.organizationId,
          metric: args?.metric,
          quantity: args?.quantity,
        });
        return successResponse(res);
      }

      case 'pulsyn.billing.checkout': {
        const res = await billingRequest('POST', '/api/billing/checkout', {
          planId: args?.planId,
          email: args?.email,
          organizationId: args?.organizationId,
        });
        return successResponse(res?.data || res);
      }

      // Benchmark operations
      case 'pulsyn.benchmark.run': {
        const res = await billingRequest('POST', '/api/benchmarks/run', {
          source: args?.source,
          target: args?.target,
          test: {
            totalRows: args?.totalRows || 100000,
            durationSeconds: args?.durationSeconds || 10,
          },
        });
        return successResponse(res?.data || res);
      }

      case 'pulsyn.benchmark.reports': {
        const limit = args?.limit || 10;
        const res = await billingRequest('GET', `/api/benchmarks/reports?limit=${limit}`);
        return successResponse(res?.data || res);
      }

      case 'pulsyn.benchmark.certification': {
        const res = await billingRequest('GET', '/api/benchmarks/certification');
        return successResponse(res?.data || res);
      }

      case 'pulsyn.benchmark.suites': {
        const res = await billingRequest('GET', '/api/benchmarks/suites');
        return successResponse(res?.data || res);
      }

      // CDC tools
      case 'pulsyn.cdc.start': {
        const res = await billingRequest('POST', '/api/cdc/start', {
          pipelineId: args?.pipelineId,
        });
        return successResponse(res?.data || res);
      }

      case 'pulsyn.cdc.stop': {
        const res = await billingRequest('POST', '/api/cdc/stop', {
          pipelineId: args?.pipelineId,
        });
        return successResponse(res?.data || res);
      }

      case 'pulsyn.cdc.status': {
        const res = await billingRequest('GET', `/api/cdc/status/${args?.pipelineId}`);
        return successResponse(res?.data || res);
      }

      case 'pulsyn.cdc.engines': {
        const res = await billingRequest('GET', '/api/cdc/engines');
        return successResponse(res?.data || res);
      }

      case 'pulsyn.cdc.events': {
        const limit = args?.limit || 100;
        const res = await billingRequest('GET', `/api/cdc/events/${args?.pipelineId}?limit=${limit}`);
        return successResponse(res?.data || res);
      }

      default:
        return errorResponse(`Unknown tool: ${name}`);
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return errorResponse(err.message, err.status);
    }
    return errorResponse(err instanceof Error ? err.message : String(err));
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[Pulsyn MCP] Server running on stdio (API: ${API_URL})`);
}

main().catch(console.error);
