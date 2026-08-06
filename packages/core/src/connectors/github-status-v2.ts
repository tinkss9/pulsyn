// GitHub Status v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/status.json', schema: { name: 'status', table: 'status', columns: [{ name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }
];

@registerSource('github-status-v2')
export class GithubStatusV2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-status-v2', 'github-status-v2', config, {
      baseUrl: config.host || 'https://www.githubstatus.com/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status.json',
    });
  }
}
