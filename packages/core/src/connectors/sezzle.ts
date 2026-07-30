// @ts-nocheck
// Sezzle Connector — Auto-generated from config
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
      { name: 'uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount_in_cents', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uuid'],
    },
    idField: 'uuid',
    
  },
];

@registerSource('sezzle')
export class SezzleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sezzle', 'sezzle', config, {
      baseUrl: config.host || 'https://sandbox.gateway.sezzle.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/merchant',
      
    });
  }
}
