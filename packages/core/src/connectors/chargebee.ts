// @ts-nocheck
// Chargebee Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'customers',
    endpoint: '/customers',
    schema: {
      name: 'customers',
      table: 'customers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
  {
    name: 'subscriptions',
    endpoint: '/subscriptions',
    schema: {
      name: 'subscriptions',
      table: 'subscriptions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'customer_id', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('chargebee')
export class ChargebeeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chargebee', 'chargebee', config, {
      baseUrl: config.host || 'https://your-site.chargebee.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
