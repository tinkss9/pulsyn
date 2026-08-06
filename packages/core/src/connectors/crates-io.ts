// Crates.io — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'crates',
    endpoint: '/crates?per_page=50',
    schema: {
      name: 'crates',
      table: 'crates',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'downloads', type: 'number', nullable: false, primaryKey: false },
        { name: 'max_version', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('crates-io')
export class CratesIoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'crates-io', 'crates-io', config, {
      baseUrl: config.host || 'https://crates.io/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/crates',
    });
  }
}
