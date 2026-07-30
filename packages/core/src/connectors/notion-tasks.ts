// @ts-nocheck
// Notion Tasks Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/databases/{databaseId}/query',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('notion-tasks')
export class NotionTasksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'notion-tasks', 'notion-tasks', config, {
      baseUrl: config.host || 'https://api.notion.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/search',
      
    });
  }
}
