// @ts-nocheck
// Zywave Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clients',
    endpoint: '/clients',
    schema: {
      name: 'clients',
      table: 'clients',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zywave')
export class ZywaveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zywave', 'zywave', config, {
      baseUrl: config.host || 'https://api.zywave.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clients',
      
    });
  }
}
