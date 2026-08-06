// Reddit Popular — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'popular', endpoint: '/r/popular.json?limit=25', schema: { name: 'popular', table: 'popular', columns: [{ name: 'data.id', type: 'string', nullable: false, primaryKey: true }, { name: 'data.title', type: 'string', nullable: false, primaryKey: false }, { name: 'data.subreddit', type: 'string', nullable: false, primaryKey: false }, { name: 'data.score', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['data.id'] }, idField: 'data.id' }
];

@registerSource('reddit-popular')
export class RedditPopularConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reddit-popular', 'reddit-popular', config, {
      baseUrl: config.host || 'https://www.reddit.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/r/popular.json',
    });
  }
}
