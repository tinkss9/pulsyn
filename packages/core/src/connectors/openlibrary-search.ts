// OpenLibrary Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'search',
    endpoint: '/search.json?q=harry+potter&limit=20',
    schema: {
      name: 'search',
      table: 'search',
      columns: [
        { name: 'key', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'author_name', type: 'json', nullable: false, primaryKey: false },
        { name: 'first_publish_year', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
  }
];

@registerSource('openlibrary-search')
export class OpenlibrarySearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openlibrary-search', 'openlibrary-search', config, {
      baseUrl: config.host || 'https://openlibrary.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.json',
    });
  }
}
