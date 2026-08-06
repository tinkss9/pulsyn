// CPAN (Perl) — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'modules', endpoint: '/module/_search?q=DBIx::Class&size=20', schema: { name: 'modules', table: 'modules', columns: [        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'version', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['_id'] }, idField: '_id' }];

@registerSource('cpan')
export class CpanConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cpan', 'cpan', config, { baseUrl: config.host || 'https://fastapi.metacpan.org/v1', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/module/_search' });
  }
}
