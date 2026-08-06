// Intercom API v2 — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'contacts', endpoint: '/contacts?per_page=20', schema: { name: 'contacts', table: 'contacts', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'email', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'conversations', endpoint: '/conversations?per_page=20', schema: { name: 'conversations', table: 'conversations', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'created_at', type: 'number', nullable: false, primaryKey: false }, { name: 'state', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('intercom-api')
export class IntercomApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'intercom-api', 'intercom-api', config, {
      baseUrl: config.host || 'https://api.intercom.io',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/contacts',
    });
  }
}
