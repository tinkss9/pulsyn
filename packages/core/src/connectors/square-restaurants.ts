// @ts-nocheck
// Square for Restaurants Connector — Auto-generated from config
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
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('square-restaurants')
export class SquareforRestaurantsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'square-restaurants', 'square-restaurants', config, {
      baseUrl: config.host || 'https://connect.squareup.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
