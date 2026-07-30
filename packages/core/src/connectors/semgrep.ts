// @ts-nocheck
// Semgrep Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'findings',
    endpoint: '/deployments/{deploymentId}/findings',
    schema: {
      name: 'findings',
      table: 'findings',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'severity', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('semgrep')
export class SemgrepConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'semgrep', 'semgrep', config, {
      baseUrl: config.host || 'https://semgrep.dev/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
