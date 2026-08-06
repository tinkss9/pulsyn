// Public APIs List — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'entries', endpoint: '/entries?https=true&limit=50', schema: { name: 'entries', table: 'entries', columns: [{ name: 'API', type: 'string', nullable: false, primaryKey: true }, { name: 'Description', type: 'string', nullable: false, primaryKey: false }, { name: 'Auth', type: 'string', nullable: false, primaryKey: false }, { name: 'Category', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['API'] }, idField: 'API' }
];

@registerSource('public-apis-list')
export class PublicApisListConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'public-apis-list', 'public-apis-list', config, {
      baseUrl: config.host || 'https://api.publicapis.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/entries',
    });
  }
}
