// @ts-nocheck
// Basecamp Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects.json',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('basecamp')
export class BasecampConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'basecamp', 'basecamp', config, {
      baseUrl: config.host || 'https://3.basecampapi.com/{accountId}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects.json',
      
    });
  }
}
