// @ts-nocheck
// Cleverbridge Connector — Auto-generated from config
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
      { name: 'OrderId', type: 'number', nullable: false, primaryKey: true },
      { name: 'Status', type: 'string', nullable: true },
      { name: 'CreatedDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['OrderId'],
    },
    idField: 'OrderId',
    
  },
];

@registerSource('cleverbridge')
export class CleverbridgeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cleverbridge', 'cleverbridge', config, {
      baseUrl: config.host || 'https://www.cleverbridge.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
