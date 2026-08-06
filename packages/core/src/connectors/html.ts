// HTML Page — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'html', endpoint: '/html', schema: { name: 'html', table: 'html', columns: [        { name: 'html', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['html'] }, idField: 'html' }];

@registerSource('html')
export class HtmlConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'html', 'html', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/html' });
  }
}
