// @ts-nocheck
// Google Workspace Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'primaryEmail', type: 'string', nullable: true },
      { name: 'name', type: 'object', nullable: true },
      { name: 'creationTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('google-workspace')
export class GoogleWorkspaceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-workspace', 'google-workspace', config, {
      baseUrl: config.host || 'https://admin.googleapis.com/admin/directory/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
