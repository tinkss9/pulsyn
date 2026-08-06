// GitHub Emojis — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'emojis', endpoint: '/emojis', schema: { name: 'emojis', table: 'emojis', columns: [        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }];

@registerSource('github-emojis')
export class GithubEmojisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-emojis', 'github-emojis', config, { baseUrl: config.host || 'https://api.github.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/emojis' });
  }
}
