// SaaS Connector Types — Shared interfaces for REST API connectors

import type { DatabaseConfig, TableSchema } from '../types';

export interface SaaSResource {
  name: string;
  endpoint: string;
  schema: TableSchema;
  idField: string;
  modifiedField?: string;
}

export interface SaaSConnectorConfig {
  engine: string;
  baseUrl: string;
  authType: 'bearer' | 'basic' | 'apikey' | 'oauth2_refresh' | 'oauth2_client';
  resources: SaaSResource[];
  paginationType: 'offset' | 'cursor' | 'link';
  rateLimit?: { requests: number; windowMs: number };
  healthEndpoint?: string;
  apiVersion?: string;
  headers?: Record<string, string>;
}

export interface SaaSExtendedConfig extends DatabaseConfig {
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  instanceUrl?: string;
  pollIntervalMs?: number;
}
