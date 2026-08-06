// Sentry API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'issues', endpoint: '/organizations/{org}/issues/?query=is:unresolved&limit=20', schema: { name: 'issues', table: 'issues', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'level', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('sentry-api')
export class SentryApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sentry-api', 'sentry-api', config, {
      baseUrl: config.host || 'https://sentry.io/api/0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/organizations/{org}/issues/',
    });
  }
}
