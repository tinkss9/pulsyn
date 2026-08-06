// Arbeitnow Jobs — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/job-board-api',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
        { name: 'slug', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'company_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'remote', type: 'boolean', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['slug'],
    },
    idField: 'slug',
  }
];

@registerSource('arbeitnow')
export class ArbeitnowConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'arbeitnow', 'arbeitnow', config, {
      baseUrl: config.host || 'https://www.arbeitnow.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/job-board-api',
    });
  }
}
