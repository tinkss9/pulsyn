// ETag Check — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'etag', endpoint: '/etag/test', schema: { name: 'etag', table: 'etag', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('etag')
export class EtagConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'etag', 'etag', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/etag/test' });
  }
}
