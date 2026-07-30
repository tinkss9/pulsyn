// @ts-nocheck
// Basecamp v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'todos',
    endpoint: '/buckets/{bucketId}/todos.json',
    schema: {
      name: 'todos',
      table: 'todos',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'completed', type: 'boolean', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('basecamp-v2')
export class Basecampv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'basecamp-v2', 'basecamp-v2', config, {
      baseUrl: config.host || 'https://3.basecampapi.com/{accountId}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects.json',
      
    });
  }
}
