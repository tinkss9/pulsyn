// @ts-nocheck
// ShipStation Connector — Auto-generated from config
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
      { name: 'orderId', type: 'number', nullable: false, primaryKey: true },
      { name: 'orderStatus', type: 'string', nullable: true },
      { name: 'createDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['orderId'],
    },
    idField: 'orderId',
    
  },
];

@registerSource('shipstation')
export class ShipStationConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shipstation', 'shipstation', config, {
      baseUrl: config.host || 'https://ssapi.shipstation.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
