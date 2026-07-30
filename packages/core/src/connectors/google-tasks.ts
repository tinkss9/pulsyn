// @ts-nocheck
// Google Tasks Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasklists',
    endpoint: '/users/@me/lists',
    schema: {
      name: 'tasklists',
      table: 'tasklists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('google-tasks')
export class GoogleTasksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-tasks', 'google-tasks', config, {
      baseUrl: config.host || 'https://tasks.googleapis.com/tasks/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/@me/lists',
      
    });
  }
}
