// Deny Page — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'deny', endpoint: '/deny', schema: { name: 'deny', table: 'deny', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('deny')
export class DenyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deny', 'deny', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/deny' });
  }
}
