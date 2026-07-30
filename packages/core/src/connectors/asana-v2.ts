// @ts-nocheck
// Asana v2 Connector — Auto-generated from config
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
      { name: 'gid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'completed', type: 'boolean', nullable: true },
      { name: 'due_on', type: 'date', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'modified_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['gid'],
    },
    idField: 'gid',
    modifiedField: 'modified_at',
  },
];

@registerSource('asana-v2')
export class Asanav2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'asana-v2', 'asana-v2', config, {
      baseUrl: config.host || 'https://app.asana.com/api/1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/me',
      
    });
  }
}
