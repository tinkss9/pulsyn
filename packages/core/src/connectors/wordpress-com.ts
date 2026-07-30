// @ts-nocheck
// WordPress.com Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/sites/{siteId}/posts',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'ID', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['ID'],
    },
    idField: 'ID',
    
  },
];

@registerSource('wordpress-com')
export class WordPresscomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wordpress-com', 'wordpress-com', config, {
      baseUrl: config.host || 'https://public-api.wordpress.com/rest/v1.1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/me',
      
    });
  }
}
