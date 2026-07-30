// @ts-nocheck
// Jira Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'issues', endpoint: '/rest/api/3/search', schema: { name: 'issues', table: 'issues', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'key', type: 'string', nullable: false },
    { name: 'summary', type: 'string', nullable: false }, { name: 'status', type: 'string', nullable: true },
    { name: 'assignee', type: 'string', nullable: true }, { name: 'created', type: 'datetime', nullable: true },
    { name: 'updated', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updated' },
  { name: 'projects', endpoint: '/rest/api/3/project', schema: { name: 'projects', table: 'projects', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'key', type: 'string', nullable: false },
    { name: 'name', type: 'string', nullable: false }, { name: 'projectTypeKey', type: 'string', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('jira')
export class JiraConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jira', 'jira', config, {
      baseUrl: config.host || 'https://your-domain.atlassian.net',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/rest/api/3/myself',
      rateLimit: { requests: 100, windowMs: 60000 },
    });
  }
}
