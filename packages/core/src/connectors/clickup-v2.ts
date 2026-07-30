// @ts-nocheck
// ClickUp v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/list/{listId}/task',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'object', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      { name: 'date_updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_updated',
  },
];

@registerSource('clickup-v2')
export class ClickUpv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clickup-v2', 'clickup-v2', config, {
      baseUrl: config.host || 'https://api.clickup.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
