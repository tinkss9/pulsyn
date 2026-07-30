// @ts-nocheck
// Jira v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'issues',
    endpoint: '/search',
    schema: {
      name: 'issues',
      table: 'issues',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'key', type: 'string', nullable: false },
      { name: 'summary', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      { name: 'updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated',
  },
];

@registerSource('jira-v3')
export class Jirav3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jira-v3', 'jira-v3', config, {
      baseUrl: config.host || 'https://your-domain.atlassian.net/rest/api/3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/myself',
      
    });
  }
}
