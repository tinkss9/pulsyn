// Stream Bytes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'stream', endpoint: '/stream-bytes/32', schema: { name: 'stream', table: 'stream', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('stream')
export class StreamConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stream', 'stream', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/stream-bytes/32' });
  }
}
