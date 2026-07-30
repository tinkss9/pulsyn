// @ts-nocheck
// MoEngage Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/report/user-attribute',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'customer_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['customer_id'],
    },
    idField: 'customer_id',
    
  },
];

@registerSource('moengage')
export class MoEngageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'moengage', 'moengage', config, {
      baseUrl: config.host || 'https://api-01.moengage.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/report/user-attribute',
      
    });
  }
}
