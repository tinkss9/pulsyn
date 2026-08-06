// HTTP Headers — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'response', endpoint: '/response-headers?X-Custom-Header=test', schema: { name: 'response', table: 'response', columns: [        { name: 'X-Custom-Header', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['X-Custom-Header'] }, idField: 'X-Custom-Header' }];

@registerSource('http-headers')
export class HttpHeadersConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'http-headers', 'http-headers', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/response-headers' });
  }
}
