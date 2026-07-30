// @ts-nocheck
// Jira Service Management Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'requests',
    endpoint: '/request',
    schema: {
      name: 'requests',
      table: 'requests',
      columns: [
      { name: 'issueId', type: 'string', nullable: false, primaryKey: true },
      { name: 'summary', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['issueId'],
    },
    idField: 'issueId',
    
  },
];

@registerSource('jira-service')
export class JiraServiceManagementConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jira-service', 'jira-service', config, {
      baseUrl: config.host || 'https://your-domain.atlassian.net/rest/servicedeskapi',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/servicedesk',
      
    });
  }
}
