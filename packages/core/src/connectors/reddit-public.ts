// Reddit Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subreddits',
    endpoint: '/r/popular.json?limit=25',
    schema: {
      name: 'subreddits',
      table: 'subreddits',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'subreddit', type: 'string', nullable: false, primaryKey: false },
        { name: 'author', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('reddit-public')
export class RedditPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reddit-public', 'reddit-public', config, {
      baseUrl: config.host || 'https://www.reddit.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/r/popular.json',
    });
  }
}
