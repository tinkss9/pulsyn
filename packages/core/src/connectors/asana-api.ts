// Asana API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'projects', endpoint: '/projects?limit=20', schema: { name: 'projects', table: 'projects', columns: [{ name: 'gid', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['gid'] }, idField: 'gid' },
{ name: 'tasks', endpoint: '/tasks?limit=20', schema: { name: 'tasks', table: 'tasks', columns: [{ name: 'gid', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'completed', type: 'boolean', nullable: false, primaryKey: false }], primaryKey: ['gid'] }, idField: 'gid' }
];

@registerSource('asana-api')
export class AsanaApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'asana-api', 'asana-api', config, {
      baseUrl: config.host || 'https://app.asana.com/api/1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
    });
  }
}
