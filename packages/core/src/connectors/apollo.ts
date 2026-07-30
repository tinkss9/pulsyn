// @ts-nocheck
// Apollo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts/search',
    schema: {
      name: 'contacts',
      table: 'contacts',
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
];

@registerSource('apollo')
export class ApolloConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'apollo', 'apollo', config, {
      baseUrl: config.host || 'https://api.apollo.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/auth/health',
      
    });
  }
}
