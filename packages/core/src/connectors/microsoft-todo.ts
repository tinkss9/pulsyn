// @ts-nocheck
// Microsoft To Do Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'lists',
    endpoint: '/me/todo/lists',
    schema: {
      name: 'lists',
      table: 'lists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('microsoft-todo')
export class MicrosoftToDoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'microsoft-todo', 'microsoft-todo', config, {
      baseUrl: config.host || 'https://graph.microsoft.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me/todo/lists',
      
    });
  }
}
