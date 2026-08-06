// GitHub Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [        { name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }];

@registerSource('github-status')
export class GithubStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-status', 'github-status', config, { baseUrl: config.host || 'https://www.githubstatus.com/api/v2', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/status.json' });
  }
}
