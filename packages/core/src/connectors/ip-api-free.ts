// ip-api Free — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'json', endpoint: '/json', schema: { name: 'json', table: 'json', columns: [{ name: 'query', type: 'string', nullable: false, primaryKey: true }, { name: 'country', type: 'string', nullable: false, primaryKey: false }, { name: 'city', type: 'string', nullable: false, primaryKey: false }, { name: 'isp', type: 'string', nullable: false, primaryKey: false }, { name: 'org', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['query'] }, idField: 'query' }
];

@registerSource('ip-api-free')
export class IpApiFreeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ip-api-free', 'ip-api-free', config, {
      baseUrl: config.host || 'http://ip-api.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/json',
    });
  }
}
