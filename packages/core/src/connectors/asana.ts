// @ts-nocheck
// Asana Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'tasks', endpoint: '/api/1.0/tasks', schema: { name: 'tasks', table: 'tasks', columns: [
    { name: 'gid', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'completed', type: 'boolean', nullable: true }, { name: 'due_on', type: 'date', nullable: true },
    { name: 'created_at', type: 'datetime', nullable: true }, { name: 'modified_at', type: 'datetime', nullable: true },
  ], primaryKey: ['gid'] }, idField: 'gid', modifiedField: 'modified_at' },
  { name: 'projects', endpoint: '/api/1.0/projects', schema: { name: 'projects', table: 'projects', columns: [
    { name: 'gid', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['gid'] }, idField: 'gid', modifiedField: 'modified_at' },
];

@registerSource('asana')
export class AsanaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'asana', 'asana', config, {
      baseUrl: config.host || 'https://app.asana.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/1.0/users/me',
    });
  }
}
