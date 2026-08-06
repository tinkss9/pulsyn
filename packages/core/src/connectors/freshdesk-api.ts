// Freshdesk API v2 — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'tickets', endpoint: '/tickets?per_page=20', schema: { name: 'tickets', table: 'tickets', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'subject', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'number', nullable: false, primaryKey: false }, { name: 'priority', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('freshdesk-api')
export class FreshdeskApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'freshdesk-api', 'freshdesk-api', config, {
      baseUrl: config.host || 'https://{domain}.freshdesk.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tickets',
    });
  }
}
