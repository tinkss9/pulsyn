// Reddit API v2 — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'subreddits', endpoint: '/subreddits/popular?limit=20', schema: { name: 'subreddits', table: 'subreddits', columns: [{ name: 'display_name', type: 'string', nullable: false, primaryKey: true }, { name: 'subscribers', type: 'number', nullable: false, primaryKey: false }, { name: 'public_description', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['display_name'] }, idField: 'display_name' }
];

@registerSource('reddit-api')
export class RedditApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reddit-api', 'reddit-api', config, {
      baseUrl: config.host || 'https://oauth.reddit.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/subreddits/popular',
    });
  }
}
