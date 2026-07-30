// @ts-nocheck
// Elastic Email Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'email', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'dateCreated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['email'],
    },
    idField: 'email',
    
  },
];

@registerSource('elastic-email')
export class ElasticEmailConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'elastic-email', 'elastic-email', config, {
      baseUrl: config.host || 'https://api.elasticemail.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/account',
      
    });
  }
}
