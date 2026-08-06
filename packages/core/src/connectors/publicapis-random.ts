// Public APIs Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'random', endpoint: '/random', schema: { name: 'random', table: 'random', columns: [{ name: 'API', type: 'string', nullable: false, primaryKey: true }, { name: 'Description', type: 'string', nullable: false, primaryKey: false }, { name: 'Category', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['API'] }, idField: 'API' }
];

@registerSource('publicapis-random')
export class PublicapisRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'publicapis-random', 'publicapis-random', config, {
      baseUrl: config.host || 'https://api.publicapis.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/random',
    });
  }
}
