// @ts-nocheck
// DeepSource Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repos',
    endpoint: '/repos',
    schema: {
      name: 'repos',
      table: 'repos',
      columns: [
      { name: 'key', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'is_active', type: 'boolean', nullable: true },
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
    
  },
];

@registerSource('deepsource')
export class DeepSourceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deepsource', 'deepsource', config, {
      baseUrl: config.host || 'https://api.deepsource.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
