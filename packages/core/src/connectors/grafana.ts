// @ts-nocheck
// Grafana Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'dashboards',
    endpoint: '/search',
    schema: {
      name: 'dashboards',
      table: 'dashboards',
      columns: [
      { name: 'uid', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      { name: 'updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uid'],
    },
    idField: 'uid',
    modifiedField: 'updated',
  },
];

@registerSource('grafana')
export class GrafanaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'grafana', 'grafana', config, {
      baseUrl: config.host || 'https://your-grafana.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/health',
      
    });
  }
}
