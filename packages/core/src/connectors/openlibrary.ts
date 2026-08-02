// Open Library Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'books',
    endpoint: '/api/books',
    schema: {
      name: 'books',
      table: 'books',
      columns: [
        { name: 'key', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'edition_count', type: 'number', nullable: true, primaryKey: false },
        { name: 'cover_id', type: 'number', nullable: true, primaryKey: false },
        { name: 'author_name', type: 'json', nullable: true, primaryKey: false },
        { name: 'first_publish_year', type: 'number', nullable: true, primaryKey: false },
        { name: 'isbn', type: 'json', nullable: true, primaryKey: false },
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
  },
  {
    name: 'authors',
    endpoint: '/api/authors',
    schema: {
      name: 'authors',
      table: 'authors',
      columns: [
        { name: 'key', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'birth_date', type: 'string', nullable: true, primaryKey: false },
        { name: 'death_date', type: 'string', nullable: true, primaryKey: false },
        { name: 'top_work', type: 'string', nullable: true, primaryKey: false },
        { name: 'work_count', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
  },
];

@registerSource('openlibrary')
export class OpenLibraryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openlibrary', 'openlibrary', config, {
      baseUrl: config.host || 'https://openlibrary.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/books?bibkeys=OL27448W&format=json',
    });
  }
}
