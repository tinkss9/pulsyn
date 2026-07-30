// @ts-nocheck
// VictoriaMetrics v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'labels',
    endpoint: '/api/v1/label/__name__/values',
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

@registerSource('victoriametrics-v2')
export class VictoriaMetricsv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'victoriametrics-v2', 'victoriametrics-v2', config, {
      baseUrl: config.host || 'https://api.victoriametrics.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status/config',
      
    });
  }
}
