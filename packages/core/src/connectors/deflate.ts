// Deflate Response — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'deflate', endpoint: '/deflate', schema: { name: 'deflate', table: 'deflate', columns: [        { name: 'deflated', type: 'boolean', nullable: false, primaryKey: true }], primaryKey: ['deflated'] }, idField: 'deflated' }];

@registerSource('deflate')
export class DeflateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deflate', 'deflate', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/deflate' });
  }
}
