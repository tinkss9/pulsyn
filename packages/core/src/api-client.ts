// Pulsyn API Client
// Shared HTTP client for CLI and MCP to communicate with the Pulsyn API

import { PipelineState, ConnectorConfig } from './types';

export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface PipelineCreateInput {
  name: string;
  source: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    engine?: string;
  };
  target: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    engine?: string;
  };
  tables: string[];
  masking?: {
    enabled: boolean;
    rules: Array<{
      table: string;
      column: string;
      type: 'hash' | 'replace' | 'format-preserving' | 'redact';
    }>;
  };
}

export interface ConnectorCreateInput {
  name: string;
  engine: string;
  config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
  };
}

export interface ConnectorTestResult {
  connectorId: string;
  status: 'connected' | 'failed';
  latency: number;
  message: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export interface PipelineMetrics {
  pipelineId: string;
  status: string;
  stats: {
    rowsRead: number;
    rowsWritten: number;
    rowsPerSecond: number;
    lagMs: number;
    errors: number;
  };
  timestamp: string;
}

export interface Checkpoint {
  id: string;
  pipelineId: string;
  lsn: string;
  timestamp: string;
  tables: Record<string, unknown>;
}

export interface ConnectorInfo {
  id: string;
  name: string;
  engine: string;
  status: string;
  config?: unknown;
  createdAt: string;
}

export interface TableInfo {
  name: string;
  columns: number;
}

export interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string;
  }>;
  primaryKey: string[];
}

export class PulsynApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? 30000;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage: string;
        try {
          const parsed = JSON.parse(errorBody);
          errorMessage = parsed.error || parsed.message || errorBody;
        } catch {
          errorMessage = errorBody;
        }
        throw new ApiError(response.status, errorMessage);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(408, `Request timeout after ${this.timeout}ms`);
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Health
  async getHealth(): Promise<HealthStatus> {
    return this.request<HealthStatus>('GET', '/api/health');
  }

  async getReady(): Promise<{ status: string; checks: Record<string, string> }> {
    return this.request('GET', '/api/health/ready');
  }

  // Pipelines
  async listPipelines(): Promise<PaginatedResponse<PipelineState>> {
    return this.request('GET', '/api/pipelines');
  }

  async getPipeline(id: string): Promise<ApiResponse<PipelineState>> {
    return this.request('GET', `/api/pipelines/${id}`);
  }

  async createPipeline(input: PipelineCreateInput): Promise<ApiResponse<PipelineState>> {
    return this.request('POST', '/api/pipelines', input);
  }

  async updatePipeline(id: string, updates: Partial<PipelineCreateInput>): Promise<ApiResponse<PipelineState>> {
    return this.request('PUT', `/api/pipelines/${id}`, updates);
  }

  async deletePipeline(id: string): Promise<void> {
    return this.request('DELETE', `/api/pipelines/${id}`);
  }

  async startPipeline(id: string): Promise<ApiResponse<PipelineState>> {
    return this.request('POST', `/api/pipelines/${id}/start`);
  }

  async stopPipeline(id: string): Promise<ApiResponse<PipelineState>> {
    return this.request('POST', `/api/pipelines/${id}/stop`);
  }

  async pausePipeline(id: string): Promise<ApiResponse<PipelineState>> {
    return this.request('POST', `/api/pipelines/${id}/pause`);
  }

  async getPipelineMetrics(id: string): Promise<ApiResponse<PipelineMetrics>> {
    return this.request('GET', `/api/pipelines/${id}/metrics`);
  }

  async getPipelineCheckpoints(id: string): Promise<PaginatedResponse<Checkpoint>> {
    return this.request('GET', `/api/pipelines/${id}/checkpoints`);
  }

  // Connectors
  async listConnectors(): Promise<PaginatedResponse<ConnectorInfo>> {
    return this.request('GET', '/api/connectors');
  }

  async getConnector(id: string): Promise<ApiResponse<ConnectorInfo>> {
    return this.request('GET', `/api/connectors/${id}`);
  }

  async createConnector(input: ConnectorCreateInput): Promise<ApiResponse<ConnectorInfo>> {
    return this.request('POST', '/api/connectors', input);
  }

  async deleteConnector(id: string): Promise<void> {
    return this.request('DELETE', `/api/connectors/${id}`);
  }

  async testConnector(id: string): Promise<ApiResponse<ConnectorTestResult>> {
    return this.request('POST', `/api/connectors/${id}/test`);
  }

  async getConnectorTables(id: string): Promise<PaginatedResponse<TableInfo>> {
    return this.request('GET', `/api/connectors/${id}/tables`);
  }

  async getTableSchema(connectorId: string, table: string): Promise<ApiResponse<TableSchema>> {
    return this.request('GET', `/api/connectors/${connectorId}/tables/${table}/schema`);
  }

  // OpenAPI spec
  async getOpenApiSpec(): Promise<unknown> {
    return this.request('GET', '/api/openapi.json');
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
