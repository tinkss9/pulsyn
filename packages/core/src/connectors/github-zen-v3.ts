// GitHub Zen v3 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'zen', endpoint: '/zen', schema: { name: 'zen', table: 'zen', columns: [{ name: 'quote', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['quote'] }, idField: 'quote' },
{ name: 'meta', endpoint: '/meta', schema: { name: 'meta', table: 'meta', columns: [{ name: 'hooks', type: 'json', nullable: false, primaryKey: true }, { name: 'api', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['hooks'] }, idField: 'hooks' }
];

@registerSource('github-zen-v3')
export class GithubZenV3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-zen-v3', 'github-zen-v3', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/zen',
    });
  }
}
