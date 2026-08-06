// TMDB Trending — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'trending', endpoint: '/trending/all/week?api_key=DEMO_KEY', schema: { name: 'trending', table: 'trending', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'overview', type: 'string', nullable: false, primaryKey: false }, { name: 'vote_average', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('tmdb-trending')
export class TmdbTrendingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tmdb-trending', 'tmdb-trending', config, {
      baseUrl: config.host || 'https://api.themoviedb.org/3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/trending/all/week',
    });
  }
}
