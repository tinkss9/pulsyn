// GitHub Users Explore — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'users', endpoint: '/users?since=0&per_page=30', schema: { name: 'users', table: 'users', columns: [{ name: 'login', type: 'string', nullable: false, primaryKey: true }, { name: 'id', type: 'number', nullable: false, primaryKey: false }, { name: 'type', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['login'] }, idField: 'login' }
];

@registerSource('github-users-explore')
export class GithubUsersExploreConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-users-explore', 'github-users-explore', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users',
    });
  }
}
