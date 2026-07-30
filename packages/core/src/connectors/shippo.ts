// @ts-nocheck
// Shippo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shipments',
    endpoint: '/shipments',
    schema: {
      name: 'shipments',
      table: 'shipments',
      columns: [
      { name: 'object_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['object_id'],
    },
    idField: 'object_id',
    
  },
];

@registerSource('shippo')
export class ShippoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shippo', 'shippo', config, {
      baseUrl: config.host || 'https://api.goshippo.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/shipments',
      
    });
  }
}
