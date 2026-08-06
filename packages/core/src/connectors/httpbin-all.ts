// HTTPBin Full — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'get', endpoint: '/get', schema: { name: 'get', table: 'get', columns: [{ name: 'url', type: 'string', nullable: false, primaryKey: true }, { name: 'origin', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['url'] }, idField: 'url' },
{ name: 'ip', endpoint: '/ip', schema: { name: 'ip', table: 'ip', columns: [{ name: 'origin', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['origin'] }, idField: 'origin' },
{ name: 'headers', endpoint: '/headers', schema: { name: 'headers', table: 'headers', columns: [{ name: 'headers', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['headers'] }, idField: 'headers' },
{ name: 'user-agent', endpoint: '/user-agent', schema: { name: 'user-agent', table: 'user-agent', columns: [{ name: 'user-agent', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['user-agent'] }, idField: 'user-agent' },
{ name: 'uuid', endpoint: '/uuid', schema: { name: 'uuid', table: 'uuid', columns: [{ name: 'uuid', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['uuid'] }, idField: 'uuid' }
];

@registerSource('httpbin-all')
export class HttpbinAllConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-all', 'httpbin-all', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get',
    });
  }
}
