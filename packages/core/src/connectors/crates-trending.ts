// Crates.io Trending — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'crates', endpoint: '/crates?sort=recent-downloads&per_page=20', schema: { name: 'crates', table: 'crates', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'description', type: 'string', nullable: false, primaryKey: false }, { name: 'downloads', type: 'number', nullable: false, primaryKey: false }, { name: 'max_version', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('crates-trending')
export class CratesTrendingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'crates-trending', 'crates-trending', config, {
      baseUrl: config.host || 'https://crates.io/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/crates',
    });
  }
}
