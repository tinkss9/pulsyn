// Random Bytes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'bytes', endpoint: '/bytes/32', schema: { name: 'bytes', table: 'bytes', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('bytes')
export class BytesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bytes', 'bytes', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/bytes/32' });
  }
}
