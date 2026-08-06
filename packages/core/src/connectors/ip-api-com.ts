// ip-api.com — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ip', endpoint: '/json', schema: { name: 'ip', table: 'ip', columns: [        { name: 'query', type: 'string', nullable: false, primaryKey: true },
        { name: 'country', type: 'string', nullable: false, primaryKey: false },
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'isp', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['query'] }, idField: 'query' }];

@registerSource('ip-api-com')
export class IpApiComConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ip-api-com', 'ip-api-com', config, { baseUrl: config.host || 'http://ip-api.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/json' });
  }
}
