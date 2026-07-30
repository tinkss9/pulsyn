// @ts-nocheck
// Gong Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/calls',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'duration', type: 'number', nullable: true },
      { name: 'started', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gong')
export class GongConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gong', 'gong', config, {
      baseUrl: config.host || 'https://api.gong.io/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/calls',
      
    });
  }
}
