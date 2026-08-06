// Hashify — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'hash', endpoint: '/hello?format=minimal', schema: { name: 'hash', table: 'hash', columns: [        { name: 'hash', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['hash'] }, idField: 'hash' }];

@registerSource('hashify')
export class HashifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hashify', 'hashify', config, { baseUrl: config.host || 'https://hashify.net', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/hello' });
  }
}
