// @ts-nocheck
// Privy Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'signups',
    endpoint: '/signups',
    schema: {
      name: 'signups',
      table: 'signups',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('privy')
export class PrivyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'privy', 'privy', config, {
      baseUrl: config.host || 'https://privy.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/accounts',
      
    });
  }
}
