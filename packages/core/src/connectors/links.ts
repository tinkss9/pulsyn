// Links Page — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'links', endpoint: '/links/5', schema: { name: 'links', table: 'links', columns: [        { name: 'html', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['html'] }, idField: 'html' }];

@registerSource('links')
export class LinksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'links', 'links', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/links/5' });
  }
}
