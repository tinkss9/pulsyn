// @ts-nocheck
// Netezza v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('netezza-v2')
export class Netezzav2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'netezza-v2', 'netezza-v2', config, {
      baseUrl: config.host || 'https://api.netezza.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/databases',
      
    });
  }
}
