// Pexels — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'photos',
    endpoint: '/popular?per_page=20',
    schema: {
      name: 'photos',
      table: 'photos',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'photographer', type: 'string', nullable: false, primaryKey: false },
        { name: 'src', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('pexels')
export class PexelsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pexels', 'pexels', config, {
      baseUrl: config.host || 'https://api.pexels.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/popular',
    });
  }
}
