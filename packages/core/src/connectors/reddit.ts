// @ts-nocheck
// Reddit Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/r/all/new',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'subreddit', type: 'string', nullable: true },
      { name: 'created_utc', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('reddit')
export class RedditConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reddit', 'reddit', config, {
      baseUrl: config.host || 'https://oauth.reddit.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/api/v1/me',
      
    });
  }
}
