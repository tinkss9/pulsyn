// OMDB API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'movies',
    endpoint: '/?apikey=DEMO_KEY&s=batman',
    schema: {
      name: 'movies',
      table: 'movies',
      columns: [
        { name: 'imdbID', type: 'string', nullable: false, primaryKey: true },
        { name: 'Title', type: 'string', nullable: false, primaryKey: false },
        { name: 'Year', type: 'string', nullable: false, primaryKey: false },
        { name: 'Type', type: 'string', nullable: false, primaryKey: false },
        { name: 'Poster', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['imdbID'],
    },
    idField: 'imdbID',
  }
];

@registerSource('omdb')
export class OmdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'omdb', 'omdb', config, {
      baseUrl: config.host || 'https://www.omdbapi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
