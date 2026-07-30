// @ts-nocheck
// Datadog Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'metrics', endpoint: '/api/v2/metrics', schema: { name: 'metrics', table: 'metrics', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'type', type: 'string', nullable: true },
    { name: 'attributes', type: 'object', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
  { name: 'monitors', endpoint: '/api/v1/monitor', schema: { name: 'monitors', table: 'monitors', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'type', type: 'string', nullable: true }, { name: 'status', type: 'string', nullable: true },
    { name: 'created', type: 'datetime', nullable: true }, { name: 'modified', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'modified' },
];

@registerSource('datadog')
export class DatadogConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'datadog', 'datadog', config, {
      baseUrl: config.host || 'https://api.datadoghq.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/v1/validate',
      headers: { 'DD-API-KEY': config.password || '' },
    });
  }
}
