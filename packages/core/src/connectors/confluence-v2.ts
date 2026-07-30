// @ts-nocheck
// Confluence v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'blogposts',
    endpoint: '/blogposts',
    schema: {
      name: 'blogposts',
      table: 'blogposts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('confluence-v2')
export class Confluencev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'confluence-v2', 'confluence-v2', config, {
      baseUrl: config.host || 'https://your-domain.atlassian.net/wiki/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/pages',
      
    });
  }
}
