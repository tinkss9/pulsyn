// Cloudflare Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [        { name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }];

@registerSource('cloudflare-status')
export class CloudflareStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cloudflare-status', 'cloudflare-status', config, { baseUrl: config.host || 'https://www.cloudflarestatus.com/api/v2', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/status.json' });
  }
}
