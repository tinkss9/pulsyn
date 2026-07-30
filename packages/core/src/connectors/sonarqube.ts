// @ts-nocheck
// SonarQube Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects/search',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'key', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'lastAnalysis', type: 'datetime', nullable: true },
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
    
  },
];

@registerSource('sonarqube')
export class SonarQubeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sonarqube', 'sonarqube', config, {
      baseUrl: config.host || 'https://your-sonarqube.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/system/status',
      
    });
  }
}
