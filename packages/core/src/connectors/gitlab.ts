// @ts-nocheck
// GitLab Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'description', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'last_activity_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'last_activity_at',
  },
  {
    name: 'issues',
    endpoint: '/issues',
    schema: {
      name: 'issues',
      table: 'issues',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('gitlab')
export class GitLabConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gitlab', 'gitlab', config, {
      baseUrl: config.host || 'https://gitlab.com/api/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'link',
      healthEndpoint: '/user',
      
    });
  }
}
