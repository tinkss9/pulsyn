// @ts-nocheck
// GitHub Actions Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'workflows',
    endpoint: '/repos/{owner}/{repo}/actions/workflows',
    schema: {
      name: 'workflows',
      table: 'workflows',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('github-actions')
export class GitHubActionsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'github-actions', 'github-actions', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
