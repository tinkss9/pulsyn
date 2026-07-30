// @ts-nocheck
// Loki Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'streams',
    endpoint: '/query_range',
    schema: {
      name: 'streams',
      table: 'streams',
      columns: [
      { name: 'stream', type: 'object', nullable: false, primaryKey: true },
      { name: 'values', type: 'object', nullable: true },
      ],
      primaryKey: ['stream'],
    },
    idField: 'stream',
    
  },
];

@registerSource('loki')
export class LokiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'loki', 'loki', config, {
      baseUrl: config.host || 'http://localhost:3100/loki/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/labels',
      
    });
  }
}
