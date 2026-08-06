// HTTPBin GET — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'get', endpoint: '/get', schema: { name: 'get', table: 'get', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true },
        { name: 'origin', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('httpbin-get')
export class HttpbinGetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-get', 'httpbin-get', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/get' });
  }
}
