// @ts-nocheck
// Todoist v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/tasks',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'content', type: 'string', nullable: false },
      { name: 'is_completed', type: 'boolean', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('todoist-v2')
export class Todoistv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'todoist-v2', 'todoist-v2', config, {
      baseUrl: config.host || 'https://api.todoist.com/rest/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
