// HTTPBin IP — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ip', endpoint: '/ip', schema: { name: 'ip', table: 'ip', columns: [        { name: 'origin', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['origin'] }, idField: 'origin' }];

@registerSource('httpbin-ip')
export class HttpbinIpConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-ip', 'httpbin-ip', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/ip' });
  }
}
