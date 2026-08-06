// Robots.txt — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'robots', endpoint: '/robots.txt', schema: { name: 'robots', table: 'robots', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('robots')
export class RobotsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'robots', 'robots', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/robots.txt' });
  }
}
