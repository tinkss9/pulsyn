// Beeceptor Sample — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/posts',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'body', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('beeceptor')
export class BeeceptorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'beeceptor', 'beeceptor', config, {
      baseUrl: config.host || 'https://jsonplaceholder.beeceptor.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/posts',
    });
  }
}
