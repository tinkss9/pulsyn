// @ts-nocheck
// Meilisearch Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'indexes',
    endpoint: '/indexes',
    schema: {
      name: 'indexes',
      table: 'indexes',
      columns: [
      { name: 'uid', type: 'string', nullable: false, primaryKey: true },
      { name: 'primaryKey', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uid'],
    },
    idField: 'uid',
    
  },
];

@registerSource('meilisearch')
export class MeilisearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'meilisearch', 'meilisearch', config, {
      baseUrl: config.host || 'http://localhost:7700',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/health',
      
    });
  }
}
