// Zendesk API v2 — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'tickets', endpoint: '/tickets.json?per_page=20', schema: { name: 'tickets', table: 'tickets', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'subject', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('zendesk-api')
export class ZendeskApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zendesk-api', 'zendesk-api', config, {
      baseUrl: config.host || 'https://{subdomain}.zendesk.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tickets.json',
    });
  }
}
