// FindWork — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'role', type: 'string', nullable: false, primaryKey: false },
        { name: 'company_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'location', type: 'string', nullable: false, primaryKey: false },
        { name: 'remote', type: 'boolean', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('findwork')
export class FindworkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'findwork', 'findwork', config, {
      baseUrl: config.host || 'https://findwork.dev/api/jobs',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
