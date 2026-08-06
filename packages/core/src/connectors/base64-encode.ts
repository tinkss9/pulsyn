// Base64 Encode — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'proxy', endpoint: '/raw?url=https://example.com', schema: { name: 'proxy', table: 'proxy', columns: [        { name: 'contents', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['contents'] }, idField: 'contents' }];

@registerSource('base64-encode')
export class Base64EncodeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'base64-encode', 'base64-encode', config, { baseUrl: config.host || 'https://api.allorigins.win', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/raw' });
  }
}
