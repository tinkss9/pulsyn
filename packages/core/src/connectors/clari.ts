// @ts-nocheck
// Clari Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'opportunities',
    endpoint: '/opportunities',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'stage', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('clari')
export class ClariConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clari', 'clari', config, {
      baseUrl: config.host || 'https://api.clari.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/opportunities',
      
    });
  }
}
