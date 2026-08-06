// OpenLibrary Books — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'trending',
    endpoint: '/trending/daily.json?limit=50',
    schema: {
      name: 'trending',
      table: 'trending',
      columns: [
        { name: 'key', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'author_name', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
  }
];

@registerSource('openlibrary-books')
export class OpenlibraryBooksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openlibrary-books', 'openlibrary-books', config, {
      baseUrl: config.host || 'https://openlibrary.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/trending/daily.json',
    });
  }
}
