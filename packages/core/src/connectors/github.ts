// @ts-nocheck
// GitHub Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'repos', endpoint: '/user/repos', schema: { name: 'repos', table: 'repos', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'full_name', type: 'string', nullable: false }, { name: 'description', type: 'string', nullable: true },
    { name: 'language', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true },
    { name: 'updated_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updated_at' },
  { name: 'issues', endpoint: '/repos/{owner}/{repo}/issues', schema: { name: 'issues', table: 'issues', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false },
    { name: 'state', type: 'string', nullable: false }, { name: 'user', type: 'string', nullable: true },
    { name: 'created_at', type: 'datetime', nullable: true }, { name: 'updated_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updated_at' },
];

@registerSource('github')
export class GithubConnector extends SaaSConnector {
  constructor(id: string, nameOrConfig?: string | DatabaseConfig, engine?: string, config?: DatabaseConfig) {
    // Registry calls with 4 args: (id, name, name, config)
    // Direct calls may use 2 args: (id, config)
    const actualConfig = (typeof nameOrConfig === 'object' ? nameOrConfig : config) as DatabaseConfig;
    super(id, 'github', 'github', actualConfig, {
      baseUrl: actualConfig?.host || 'https://api.github.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'link',
      healthEndpoint: '/user',
      rateLimit: { requests: 5000, windowMs: 3600000 },
    });
  }
}
