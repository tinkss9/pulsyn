// GitHub Meta — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'meta', endpoint: '/meta', schema: { name: 'meta', table: 'meta', columns: [        { name: 'hooks', type: 'json', nullable: false, primaryKey: true },
        { name: 'api', type: 'json', nullable: false, primaryKey: false },
        { name: 'git', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['hooks'] }, idField: 'hooks' }];

@registerSource('github-meta')
export class GithubMetaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-meta', 'github-meta', config, { baseUrl: config.host || 'https://api.github.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/meta' });
  }
}
