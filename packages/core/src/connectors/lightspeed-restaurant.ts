// @ts-nocheck
// Lightspeed Restaurant Connector — Auto-generated from config
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
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('lightspeed-restaurant')
export class LightspeedRestaurantConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lightspeed-restaurant', 'lightspeed-restaurant', config, {
      baseUrl: config.host || 'https://api.lightspeedrestaurant.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
