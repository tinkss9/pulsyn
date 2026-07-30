// @ts-nocheck
// Renovate Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pull_requests',
    endpoint: '/repos/{owner}/{repo}/pulls',
    schema: {
      name: 'pull_requests',
      table: 'pull_requests',
      columns: [
      { name: 'number', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['number'],
    },
    idField: 'number',
    
  },
];

@registerSource('renovate')
export class RenovateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'renovate', 'renovate', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
