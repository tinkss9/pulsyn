// @ts-nocheck
// ShipBob Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('shipbob')
export class ShipBobConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shipbob', 'shipbob', config, {
      baseUrl: config.host || 'https://api.shipbob.com/2024-07',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
