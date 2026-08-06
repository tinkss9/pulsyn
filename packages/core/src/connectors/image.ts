// Image PNG — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'image', endpoint: '/image/png', schema: { name: 'image', table: 'image', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('image')
export class ImageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'image', 'image', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/image/png' });
  }
}
