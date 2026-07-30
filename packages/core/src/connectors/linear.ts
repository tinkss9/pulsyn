// @ts-nocheck
// Linear Connector — Real implementation (GraphQL API)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'issues', endpoint: '/graphql', schema: { name: 'issues', table: 'issues', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false },
    { name: 'state', type: 'string', nullable: true }, { name: 'priority', type: 'number', nullable: true },
    { name: 'assignee', type: 'string', nullable: true }, { name: 'createdAt', type: 'datetime', nullable: true },
    { name: 'updatedAt', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updatedAt' },
  { name: 'projects', endpoint: '/graphql', schema: { name: 'projects', table: 'projects', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'state', type: 'string', nullable: true }, { name: 'createdAt', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updatedAt' },
];

@registerSource('linear')
export class LinearConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'linear', 'linear', config, {
      baseUrl: config.host || 'https://api.linear.app',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/graphql',
    });
  }
}
