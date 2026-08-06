// GitHub Zen v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'zen', endpoint: '/zen', schema: { name: 'zen', table: 'zen', columns: [        { name: 'quote', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['quote'] }, idField: 'quote' }];

@registerSource('github-zen2')
export class GithubZen2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-zen2', 'github-zen2', config, { baseUrl: config.host || 'https://api.github.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/zen' });
  }
}
