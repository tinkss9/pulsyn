// GitHub Trending — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'trending',
    endpoint: '/repositories?language=&since=daily',
    schema: {
      name: 'trending',
      table: 'trending',
      columns: [
        { name: 'author', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'stars', type: 'number', nullable: false, primaryKey: false },
        { name: 'language', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['author'],
    },
    idField: 'author',
  }
];

@registerSource('github-trending')
export class GithubTrendingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-trending', 'github-trending', config, {
      baseUrl: config.host || 'https://api.gitterapp.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/repositories',
    });
  }
}
