// @ts-nocheck
// AWeber Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/accounts/{accountId}/lists/{listId}/subscribers',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'subscribed_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('aweber')
export class AWeberConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aweber', 'aweber', config, {
      baseUrl: config.host || 'https://api.aweber.com/1.2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
