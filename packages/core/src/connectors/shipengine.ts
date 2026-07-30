// @ts-nocheck
// ShipEngine Connector — Auto-generated from config
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
      { name: 'shipment_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['shipment_id'],
    },
    idField: 'shipment_id',
    
  },
];

@registerSource('shipengine')
export class ShipEngineConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shipengine', 'shipengine', config, {
      baseUrl: config.host || 'https://api.shipengine.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/carriers',
      
    });
  }
}
