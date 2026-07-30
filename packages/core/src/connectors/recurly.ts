// @ts-nocheck
// Recurly Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
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
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('recurly')
export class RecurlyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'recurly', 'recurly', config, {
      baseUrl: config.host || 'https://v3.recurly.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
