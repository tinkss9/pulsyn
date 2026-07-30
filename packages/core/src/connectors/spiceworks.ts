// @ts-nocheck
// Spiceworks Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'summary', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('spiceworks')
export class SpiceworksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'spiceworks', 'spiceworks', config, {
      baseUrl: config.host || 'https://api.spiceworks.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/tickets',
      
    });
  }
}
