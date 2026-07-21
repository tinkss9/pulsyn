// Pulsyn API — OpenAPI 3.0 Specification
// Comprehensive API documentation for the AI-Native CDC Platform

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Pulsyn API',
    version: '0.1.0',
    description:
      'The AI-Native CDC Platform API — Real-time change data capture without the complexity.\n\n' +
      'Pulsyn provides pipeline-based CDC (Change Data Capture) between databases with ' +
      'checkpoint recovery, connector certification, and MCP integration for AI agents.\n\n' +
      '## Authentication\n\n' +
      'All endpoints (except health) require an API key passed via the `Authorization` header:\n\n' +
      '```\nAuthorization: Bearer YOUR_API_KEY\n```\n\n' +
      '## Rate Limits\n\n' +
      '| Tier | Requests/min | Rows/day |\n' +
      '|------|-------------|----------|\n' +
      '| Free | 60 | 10,000 |\n' +
      '| Standard | 600 | 100,000 |\n' +
      '| Premium | 6,000 | 1,000,000 |\n\n' +
      '## Errors\n\n' +
      'All errors return `{ "error": "message" }` with appropriate HTTP status codes.\n',
    contact: {
      name: 'Pulsyn Support',
      email: 'support@pulsyn.io',
      url: 'https://pulsyn.io/docs',
    },
    license: {
      name: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: 'Local development',
    },
    {
      url: 'https://api.pulsyn.io',
      description: 'Production',
    },
  ],
  tags: [
    { name: 'Health', description: 'Server health and readiness checks' },
    { name: 'Pipelines', description: 'Create, manage, and monitor replication pipelines' },
    { name: 'Connectors', description: 'Database connector management and testing' },
    { name: 'Replication', description: 'Start, stop, and monitor replication jobs' },
    { name: 'Metrics', description: 'Pipeline performance metrics and checkpoints' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'API key passed as Bearer token',
      },
    },
    schemas: {
      // ─── Error ─────────────────────────────────────────────
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string', description: 'Human-readable error message' },
          status: { type: 'integer', description: 'HTTP status code' },
        },
        example: { error: 'Pipeline not found', status: 404 },
      },

      // ─── Health ────────────────────────────────────────────
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' },
          version: { type: 'string', example: '0.1.0' },
          timestamp: { type: 'string', format: 'date-time' },
          uptime: { type: 'number', description: 'Server uptime in seconds', example: 12345 },
        },
      },
      ReadinessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ready', 'not_ready'], example: 'ready' },
          checks: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: { database: 'ok', cache: 'ok' },
          },
        },
      },

      // ─── Pipeline ──────────────────────────────────────────
      Pipeline: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique pipeline identifier', example: 'pipeline-1721606400000' },
          name: { type: 'string', description: 'Human-readable pipeline name', example: 'users-replication' },
          status: { $ref: '#/components/schemas/PipelineStatus' },
          source: { $ref: '#/components/schemas/DatabaseEndpoint' },
          target: { $ref: '#/components/schemas/DatabaseEndpoint' },
          tables: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tables being replicated',
            example: ['public.users', 'public.orders'],
          },
          masking: { $ref: '#/components/schemas/MaskingConfig' },
          stats: { $ref: '#/components/schemas/PipelineStats' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          startedAt: { type: 'string', format: 'date-time' },
          stoppedAt: { type: 'string', format: 'date-time' },
        },
      },
      PipelineStatus: {
        type: 'string',
        enum: ['idle', 'running', 'paused', 'error', 'recovering'],
        description: 'Current pipeline state',
      },
      DatabaseEndpoint: {
        type: 'object',
        properties: {
          engine: { type: 'string', enum: ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'], example: 'postgresql' },
          host: { type: 'string', example: 'db.example.com' },
          port: { type: 'integer', example: 5432 },
          database: { type: 'string', example: 'production' },
          user: { type: 'string', example: 'replicator' },
        },
      },
      PipelineStats: {
        type: 'object',
        properties: {
          rowsRead: { type: 'integer', description: 'Total rows read from source', example: 150000 },
          rowsWritten: { type: 'integer', description: 'Total rows written to target', example: 149850 },
          rowsPerSecond: { type: 'integer', description: 'Current throughput', example: 1234 },
          lagMs: { type: 'integer', description: 'Replication lag in milliseconds', example: 45 },
          errors: { type: 'integer', description: 'Total error count', example: 0 },
          lastError: { type: 'string', nullable: true },
        },
      },
      MaskingConfig: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          rules: {
            type: 'array',
            items: { $ref: '#/components/schemas/MaskingRule' },
          },
        },
      },
      MaskingRule: {
        type: 'object',
        properties: {
          table: { type: 'string', example: 'public.users' },
          column: { type: 'string', example: 'email' },
          type: { type: 'string', enum: ['hash', 'replace', 'format-preserving', 'redact'], example: 'hash' },
        },
      },

      // ─── Connector ─────────────────────────────────────────
      Connector: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'connector-1721606400000' },
          name: { type: 'string', example: 'Production PostgreSQL' },
          engine: { type: 'string', enum: ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'], example: 'postgresql' },
          status: { type: 'string', enum: ['connected', 'disconnected', 'error'], example: 'connected' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      ConnectorConfig: {
        type: 'object',
        required: ['host', 'port', 'database', 'user', 'password'],
        properties: {
          host: { type: 'string', example: 'db.example.com' },
          port: { type: 'integer', example: 5432 },
          database: { type: 'string', example: 'production' },
          user: { type: 'string', example: 'admin' },
          password: { type: 'string', format: 'password', example: 'secret' },
          ssl: { type: 'boolean', default: false },
        },
      },
      ConnectorTestResult: {
        type: 'object',
        properties: {
          connectorId: { type: 'string' },
          status: { type: 'string', enum: ['connected', 'failed'] },
          latency: { type: 'integer', description: 'Connection latency in ms', example: 45 },
          message: { type: 'string', example: 'Connection successful' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      TableInfo: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'users' },
          columns: { type: 'integer', example: 8 },
        },
      },
      TableSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'users' },
          columns: {
            type: 'array',
            items: { $ref: '#/components/schemas/ColumnSchema' },
          },
          primaryKey: {
            type: 'array',
            items: { type: 'string' },
            example: ['id'],
          },
        },
      },
      ColumnSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'id' },
          type: { type: 'string', example: 'integer' },
          nullable: { type: 'boolean', example: false },
          defaultValue: { type: 'string', nullable: true },
        },
      },

      // ─── Checkpoint ────────────────────────────────────────
      Checkpoint: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'checkpoint-1721606400000' },
          pipelineId: { type: 'string' },
          lsn: { type: 'string', description: 'Log sequence number', example: '0/1234567' },
          timestamp: { type: 'string', format: 'date-time' },
          tables: { type: 'object', additionalProperties: { type: 'object' } },
        },
      },

      // ─── Metrics ───────────────────────────────────────────
      PipelineMetrics: {
        type: 'object',
        properties: {
          pipelineId: { type: 'string' },
          status: { $ref: '#/components/schemas/PipelineStatus' },
          stats: { $ref: '#/components/schemas/PipelineStats' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Create Inputs ─────────────────────────────────────
      CreatePipelineInput: {
        type: 'object',
        required: ['name', 'source', 'target', 'tables'],
        properties: {
          name: { type: 'string', description: 'Pipeline name', example: 'users-replication' },
          source: {
            type: 'object',
            required: ['host', 'port', 'database', 'user', 'password'],
            properties: {
              host: { type: 'string', example: 'source-db.example.com' },
              port: { type: 'integer', example: 5432 },
              database: { type: 'string', example: 'production' },
              user: { type: 'string', example: 'replicator' },
              password: { type: 'string', format: 'password' },
              engine: { type: 'string', enum: ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'], default: 'postgresql' },
            },
          },
          target: {
            type: 'object',
            required: ['host', 'port', 'database', 'user', 'password'],
            properties: {
              host: { type: 'string', example: 'target-db.example.com' },
              port: { type: 'integer', example: 5432 },
              database: { type: 'string', example: 'warehouse' },
              user: { type: 'string', example: 'writer' },
              password: { type: 'string', format: 'password' },
              engine: { type: 'string', enum: ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'], default: 'postgresql' },
            },
          },
          tables: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tables to replicate',
            example: ['public.users', 'public.orders'],
          },
          masking: { $ref: '#/components/schemas/MaskingConfig' },
        },
      },
      CreateConnectorInput: {
        type: 'object',
        required: ['name', 'engine', 'config'],
        properties: {
          name: { type: 'string', description: 'Connector name', example: 'Production PostgreSQL' },
          engine: { type: 'string', enum: ['postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'] },
          config: { $ref: '#/components/schemas/ConnectorConfig' },
        },
      },

      // ─── Paginated Response ────────────────────────────────
      PaginatedMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }],
  paths: {
    // ─── Health ────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns server health status, version, and uptime. No authentication required.',
        security: [],
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness check',
        description: 'Returns server readiness status including dependency checks (database, cache). No authentication required.',
        security: [],
        operationId: 'getReadiness',
        responses: {
          '200': {
            description: 'Server is ready',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReadinessResponse' },
              },
            },
          },
          '503': {
            description: 'Server is not ready',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReadinessResponse' },
              },
            },
          },
        },
      },
    },

    // ─── Pipelines ─────────────────────────────────────────────
    '/api/pipelines': {
      get: {
        tags: ['Pipelines'],
        summary: 'List all pipelines',
        description: 'Returns all replication pipelines with their current status and statistics.',
        operationId: 'listPipelines',
        responses: {
          '200': {
            description: 'List of pipelines',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Pipeline' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized — missing or invalid API key',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      post: {
        tags: ['Pipelines'],
        summary: 'Create a pipeline',
        description:
          'Creates a new replication pipeline between source and target databases. ' +
          'The pipeline starts in `idle` status — use the start endpoint to begin replication.',
        operationId: 'createPipeline',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePipelineInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Pipeline created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}': {
      get: {
        tags: ['Pipelines'],
        summary: 'Get pipeline details',
        description: 'Returns detailed information about a specific pipeline including config, status, and stats.',
        operationId: 'getPipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pipeline ID',
            example: 'pipeline-1721606400000',
          },
        ],
        responses: {
          '200': {
            description: 'Pipeline details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      put: {
        tags: ['Pipelines'],
        summary: 'Update a pipeline',
        description: 'Updates an existing pipeline configuration. Cannot update a running pipeline — stop it first.',
        operationId: 'updatePipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePipelineInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Pipeline updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      delete: {
        tags: ['Pipelines'],
        summary: 'Delete a pipeline',
        description: 'Permanently deletes a pipeline and its checkpoints. Cannot be undone.',
        operationId: 'deletePipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Pipeline deleted' },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}/start': {
      post: {
        tags: ['Replication'],
        summary: 'Start replication',
        description:
          'Starts CDC replication for a pipeline. The pipeline must be in `idle` or `paused` status. ' +
          'Replication begins from the last checkpoint if one exists.',
        operationId: 'startPipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Replication started',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '409': {
            description: 'Pipeline already running',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}/stop': {
      post: {
        tags: ['Replication'],
        summary: 'Stop replication',
        description:
          'Stops CDC replication for a pipeline. A checkpoint is saved before stopping, ' +
          'allowing replication to resume from this point later.',
        operationId: 'stopPipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Replication stopped',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}/pause': {
      post: {
        tags: ['Replication'],
        summary: 'Pause replication',
        description: 'Pauses CDC replication. The pipeline retains its position and can be resumed with start.',
        operationId: 'pausePipeline',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Replication paused',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Pipeline' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}/metrics': {
      get: {
        tags: ['Metrics'],
        summary: 'Get pipeline metrics',
        description: 'Returns real-time performance metrics for a running pipeline.',
        operationId: 'getPipelineMetrics',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Pipeline metrics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/PipelineMetrics' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/pipelines/{id}/checkpoints': {
      get: {
        tags: ['Metrics'],
        summary: 'Get pipeline checkpoints',
        description:
          'Returns the checkpoint history for a pipeline. Checkpoints are saved periodically and on stop, ' +
          'enabling exactly-once semantics and resumable replication.',
        operationId: 'getPipelineCheckpoints',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Checkpoint history',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Checkpoint' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Pipeline not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },

    // ─── Connectors ────────────────────────────────────────────
    '/api/connectors': {
      get: {
        tags: ['Connectors'],
        summary: 'List all connectors',
        description: 'Returns all configured database connectors.',
        operationId: 'listConnectors',
        responses: {
          '200': {
            description: 'List of connectors',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Connector' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Connectors'],
        summary: 'Create a connector',
        description: 'Creates a new database connector. Use the test endpoint to verify the connection before creating pipelines.',
        operationId: 'createConnector',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConnectorInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Connector created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Connector' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/connectors/{id}': {
      get: {
        tags: ['Connectors'],
        summary: 'Get connector details',
        description: 'Returns details of a specific connector.',
        operationId: 'getConnector',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Connector details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Connector' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Connector not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
      delete: {
        tags: ['Connectors'],
        summary: 'Delete a connector',
        description: 'Permanently deletes a connector. Pipelines using this connector will fail.',
        operationId: 'deleteConnector',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Connector deleted' },
          '404': {
            description: 'Connector not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/connectors/{id}/test': {
      post: {
        tags: ['Connectors'],
        summary: 'Test connection',
        description: 'Tests the database connection for a connector and returns latency measurements.',
        operationId: 'testConnector',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Connection test result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/ConnectorTestResult' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Connector not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/connectors/{id}/tables': {
      get: {
        tags: ['Connectors'],
        summary: 'List tables',
        description: 'Lists all tables available in the connected database.',
        operationId: 'getConnectorTables',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Table list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TableInfo' },
                    },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Connector not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/connectors/{id}/tables/{table}/schema': {
      get: {
        tags: ['Connectors'],
        summary: 'Get table schema',
        description: 'Returns the column definitions, types, and primary key for a specific table.',
        operationId: 'getTableSchema',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'table',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Table name',
          },
        ],
        responses: {
          '200': {
            description: 'Table schema',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/TableSchema' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Connector or table not found',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
};
