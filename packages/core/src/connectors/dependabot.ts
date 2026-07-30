// @ts-nocheck
// Dependabot Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'alerts',
    endpoint: '/repos/{owner}/{repo}/dependabot/alerts',
    schema: {
      name: 'alerts',
      table: 'alerts',
      columns: [
      { name: 'number', type: 'number', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'dependency', type: 'object', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['number'],
    },
    idField: 'number',
    
  },
];

@registerSource('dependabot')
export class DependabotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dependabot', 'dependabot', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
