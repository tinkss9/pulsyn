// OMDB Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'search', endpoint: '/?apikey=DEMO_KEY&s=star+wars', schema: { name: 'search', table: 'search', columns: [{ name: 'imdbID', type: 'string', nullable: false, primaryKey: true }, { name: 'Title', type: 'string', nullable: false, primaryKey: false }, { name: 'Year', type: 'string', nullable: false, primaryKey: false }, { name: 'Type', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['imdbID'] }, idField: 'imdbID' }
];

@registerSource('omdb-search')
export class OmdbSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'omdb-search', 'omdb-search', config, {
      baseUrl: config.host || 'https://www.omdbapi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
