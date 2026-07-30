// @ts-nocheck
// Height Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/lists/{listId}/tasks',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('height')
export class HeightConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'height', 'height', config, {
      baseUrl: config.host || 'https://api.height.app/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/lists',
      
    });
  }
}
