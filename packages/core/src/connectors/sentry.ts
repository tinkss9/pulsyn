// @ts-nocheck
// Sentry Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'issues', endpoint: '/api/0/issues/', schema: { name: 'issues', table: 'issues', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false },
    { name: 'level', type: 'string', nullable: true }, { name: 'status', type: 'string', nullable: true },
    { name: 'count', type: 'number', nullable: true }, { name: 'firstSeen', type: 'datetime', nullable: true },
    { name: 'lastSeen', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'lastSeen' },
  { name: 'projects', endpoint: '/api/0/projects/', schema: { name: 'projects', table: 'projects', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'slug', type: 'string', nullable: false }, { name: 'dateCreated', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('sentry')
export class SentryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sentry', 'sentry', config, {
      baseUrl: config.host || 'https://sentry.io',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/api/0/',
    });
  }
}
