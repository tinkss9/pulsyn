// @ts-nocheck
// Toast Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/orders/v2/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'guid', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['guid'],
    },
    idField: 'guid',
    
  },
];

@registerSource('toast')
export class ToastConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'toast', 'toast', config, {
      baseUrl: config.host || 'https://ws-api.toasttab.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders/v2/orders',
      
    });
  }
}
