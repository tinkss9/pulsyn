// Cache Check — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'cache', endpoint: '/cache', schema: { name: 'cache', table: 'cache', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('cache')
export class CacheConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cache', 'cache', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/cache' });
  }
}
