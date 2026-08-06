// Encoding UTF8 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'encoding', endpoint: '/encoding/utf8', schema: { name: 'encoding', table: 'encoding', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('encoding')
export class EncodingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'encoding', 'encoding', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/encoding/utf8' });
  }
}
