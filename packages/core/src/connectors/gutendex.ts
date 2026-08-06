// Gutenberg API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'books',
    endpoint: '/books?mime_type=text/plain',
    schema: {
      name: 'books',
      table: 'books',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'authors', type: 'json', nullable: false, primaryKey: false },
        { name: 'languages', type: 'json', nullable: false, primaryKey: false },
        { name: 'download_count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('gutendex')
export class GutendexConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gutendex', 'gutendex', config, {
      baseUrl: config.host || 'https://gutendex.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/books',
    });
  }
}
