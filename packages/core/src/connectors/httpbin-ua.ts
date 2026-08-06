// HTTPBin UA — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ua', endpoint: '/user-agent', schema: { name: 'ua', table: 'ua', columns: [        { name: 'user-agent', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['user-agent'] }, idField: 'user-agent' }];

@registerSource('httpbin-ua')
export class HttpbinUaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-ua', 'httpbin-ua', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/user-agent' });
  }
}
