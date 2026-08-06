// HTTPBin Base64 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'decode', endpoint: '/base64/dGVzdA==', schema: { name: 'decode', table: 'decode', columns: [{ name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }
];

@registerSource('httpbin-base64')
export class HttpbinBase64Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-base64', 'httpbin-base64', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/base64/dGVzdA==',
    });
  }
}
