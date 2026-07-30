// @ts-nocheck
// Snyk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/org/{orgId}/projects',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('snyk')
export class SnykConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'snyk', 'snyk', config, {
      baseUrl: config.host || 'https://api.snyk.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user/me',
      
    });
  }
}
