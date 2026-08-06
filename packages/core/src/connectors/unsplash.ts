// Unsplash — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'photos',
    endpoint: '/photos?per_page=20&client_id=demo',
    schema: {
      name: 'photos',
      table: 'photos',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'user', type: 'json', nullable: false, primaryKey: false },
        { name: 'urls', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('unsplash')
export class UnsplashConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'unsplash', 'unsplash', config, {
      baseUrl: config.host || 'https://api.unsplash.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/photos',
    });
  }
}
