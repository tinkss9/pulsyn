// Gutendex v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'books',
    endpoint: '/books?search=shakespeare',
    schema: {
      name: 'books',
      table: 'books',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'authors', type: 'json', nullable: false, primaryKey: false },
        { name: 'download_count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('gutendex2')
export class Gutendex2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gutendex2', 'gutendex2', config, {
      baseUrl: config.host || 'https://gutendex.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/books',
    });
  }
}
