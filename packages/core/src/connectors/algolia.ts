// @ts-nocheck
// Algolia Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'indices',
    endpoint: '/indexes',
    schema: {
      name: 'indices',
      table: 'indices',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'entries', type: 'number', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('algolia')
export class AlgoliaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'algolia', 'algolia', config, {
      baseUrl: config.host || 'https://your-app-id-dsn.algolia.net/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/indexes',
      
    });
  }
}
