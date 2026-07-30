// @ts-nocheck
// Revel Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('revel')
export class RevelConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'revel', 'revel', config, {
      baseUrl: config.host || 'https://api.revelsystems.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/orders',
      
    });
  }
}
