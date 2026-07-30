// @ts-nocheck
// GitGuardian Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'incidents',
    endpoint: '/incidents',
    schema: {
      name: 'incidents',
      table: 'incidents',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'severity', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gitguardian')
export class GitGuardianConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gitguardian', 'gitguardian', config, {
      baseUrl: config.host || 'https://api.gitguardian.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/health',
      
    });
  }
}
