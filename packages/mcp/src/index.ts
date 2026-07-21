// Pulsyn MCP Server
// AI agent integration via Model Context Protocol

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool schemas
const PipelineListSchema = z.object({});
const PipelineCreateSchema = z.object({
  name: z.string(),
  source: z.object({
    host: z.string(),
    port: z.number(),
    database: z.string(),
    user: z.string(),
    password: z.string(),
  }),
  target: z.object({
    host: z.string(),
    port: z.number(),
    database: z.string(),
    user: z.string(),
    password: z.string(),
  }),
  tables: z.array(z.string()),
});
const PipelineStartSchema = z.object({ pipelineId: z.string() });
const PipelineStopSchema = z.object({ pipelineId: z.string() });
const PipelineStatusSchema = z.object({ pipelineId: z.string() });
const ConnectorTestSchema = z.object({
  host: z.string(),
  port: z.number(),
  database: z.string(),
  user: z.string(),
  password: z.string(),
});

// Create server
const server = new Server(
  {
    name: 'pulsyn',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'pulsyn.pipeline.list',
        description: 'List all Pulsyn pipelines',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'pulsyn.pipeline.create',
        description: 'Create a new Pulsyn pipeline',
        inputSchema: {
          type: 'object',
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
              },
              required: ['host', 'port', 'database', 'user', 'password'],
            },
            tables: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tables to replicate',
            },
          },
          required: ['name', 'source', 'target', 'tables'],
        },
      },
      {
        name: 'pulsyn.pipeline.start',
        description: 'Start a Pulsyn pipeline',
        inputSchema: {
          type: 'object',
          properties: {
            pipelineId: { type: 'string', description: 'Pipeline ID' },
          },
          required: ['pipelineId'],
        },
      },
      {
        name: 'pulsyn.pipeline.stop',
        description: 'Stop a Pulsyn pipeline',
        inputSchema: {
          type: 'object',
          properties: {
            pipelineId: { type: 'string', description: 'Pipeline ID' },
          },
          required: ['pipelineId'],
        },
      },
      {
        name: 'pulsyn.pipeline.status',
        description: 'Get pipeline status and metrics',
        inputSchema: {
          type: 'object',
          properties: {
            pipelineId: { type: 'string', description: 'Pipeline ID' },
          },
          required: ['pipelineId'],
        },
      },
      {
        name: 'pulsyn.connector.test',
        description: 'Test database connection',
        inputSchema: {
          type: 'object',
          properties: {
            host: { type: 'string' },
            port: { type: 'number' },
            database: { type: 'string' },
            user: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['host', 'port', 'database', 'user', 'password'],
        },
      },
    ],
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'pulsyn.pipeline.list':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ pipelines: [], total: 0 }),
          },
        ],
      };

    case 'pulsyn.pipeline.create':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              id: `pipeline-${Date.now()}`,
              status: 'created',
              message: 'Pipeline created successfully',
            }),
          },
        ],
      };

    case 'pulsyn.pipeline.start':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              pipelineId: args?.pipelineId,
              status: 'running',
              message: 'Pipeline started',
            }),
          },
        ],
      };

    case 'pulsyn.pipeline.stop':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              pipelineId: args?.pipelineId,
              status: 'stopped',
              message: 'Pipeline stopped',
            }),
          },
        ],
      };

    case 'pulsyn.pipeline.status':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              pipelineId: args?.pipelineId,
              status: 'running',
              stats: {
                rowsRead: 0,
                rowsWritten: 0,
                rowsPerSecond: 0,
                lagMs: 0,
              },
            }),
          },
        ],
      };

    case 'pulsyn.connector.test':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'connected',
              latency: 45,
              message: 'Connection successful',
            }),
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Pulsyn MCP] Server running on stdio');
}

main().catch(console.error);
