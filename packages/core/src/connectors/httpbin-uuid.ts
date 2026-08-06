// HTTPBin UUID — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'uuid', endpoint: '/uuid', schema: { name: 'uuid', table: 'uuid', columns: [{ name: 'uuid', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['uuid'] }, idField: 'uuid' }
];

@registerSource('httpbin-uuid')
export class HttpbinUuidConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-uuid', 'httpbin-uuid', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/uuid',
    });
  }
}
