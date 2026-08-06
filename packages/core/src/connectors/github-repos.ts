// GitHub Repos — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'repos', endpoint: '/repositories?per_page=30', schema: { name: 'repos', table: 'repos', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'full_name', type: 'string', nullable: false, primaryKey: false }, { name: 'description', type: 'string', nullable: false, primaryKey: false }, { name: 'stargazers_count', type: 'number', nullable: false, primaryKey: false }, { name: 'language', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'trending', endpoint: '/search/repositories?q=stars:>1000&sort=stars&per_page=30', schema: { name: 'trending', table: 'trending', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'stargazers_count', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('github-repos')
export class GithubReposConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-repos', 'github-repos', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/repositories',
    });
  }
}
