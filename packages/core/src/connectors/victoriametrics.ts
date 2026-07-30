// @ts-nocheck
// VictoriaMetrics Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'labels',
    endpoint: '/labels',
    schema: {
      name: 'labels',
      table: 'labels',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('victoriametrics')
export class VictoriaMetricsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'victoriametrics', 'victoriametrics', config, {
      baseUrl: config.host || 'http://localhost:8428/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status/config',
      
    });
  }
}
