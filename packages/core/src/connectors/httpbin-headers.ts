// HTTPBin Headers — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'headers', endpoint: '/headers', schema: { name: 'headers', table: 'headers', columns: [        { name: 'headers', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['headers'] }, idField: 'headers' }];

@registerSource('httpbin-headers')
export class HttpbinHeadersConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-headers', 'httpbin-headers', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/headers' });
  }
}
