// Vercel Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [{ name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }
];

@registerSource('vercel-status')
export class VercelStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vercel-status', 'vercel-status', config, {
      baseUrl: config.host || 'https://www.vercel-status.com/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status.json',
    });
  }
}
