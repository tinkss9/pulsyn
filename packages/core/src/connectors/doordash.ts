// @ts-nocheck
// DoorDash Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/drive/v2/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'external_delivery_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'delivery_status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['external_delivery_id'],
    },
    idField: 'external_delivery_id',
    
  },
];

@registerSource('doordash')
export class DoorDashConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'doordash', 'doordash', config, {
      baseUrl: config.host || 'https://openapi.doordash.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/drive/v2/orders',
      
    });
  }
}
