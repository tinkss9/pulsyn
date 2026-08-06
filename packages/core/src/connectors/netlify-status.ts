// Netlify Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [{ name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }
];

@registerSource('netlify-status')
export class NetlifyStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'netlify-status', 'netlify-status', config, {
      baseUrl: config.host || 'https://www.netlifystatus.com/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status.json',
    });
  }
}
