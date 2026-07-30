// @ts-nocheck
// Grafana Mimir Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'metrics',
    endpoint: '/api/v1/label/__name__/values',
    schema: {
      name: 'metrics',
      table: 'metrics',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('grafana-mimir')
export class GrafanaMimirConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'grafana-mimir', 'grafana-mimir', config, {
      baseUrl: config.host || 'http://localhost:9009/prometheus',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/v1/status/config',
      
    });
  }
}
