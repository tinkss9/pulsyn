// ClickUp API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'tasks', endpoint: '/list/{id}/task?subtasks=true&limit=20', schema: { name: 'tasks', table: 'tasks', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('clickup-api')
export class ClickupApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clickup-api', 'clickup-api', config, {
      baseUrl: config.host || 'https://api.clickup.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/list/{id}/task',
    });
  }
}
