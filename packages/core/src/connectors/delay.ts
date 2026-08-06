// HTTP Delay — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'delay', endpoint: '/delay/1', schema: { name: 'delay', table: 'delay', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('delay')
export class DelayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'delay', 'delay', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/delay/1' });
  }
}
