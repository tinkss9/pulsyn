// @ts-nocheck
// SendGrid Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'contacts', endpoint: '/v3/marketing/contacts', schema: { name: 'contacts', table: 'contacts', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'email', type: 'string', nullable: false },
    { name: 'first_name', type: 'string', nullable: true }, { name: 'last_name', type: 'string', nullable: true },
    { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'updated_at' },
  { name: 'templates', endpoint: '/v3/templates', schema: { name: 'templates', table: 'templates', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('sendgrid')
export class SendGridConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sendgrid', 'sendgrid', config, {
      baseUrl: config.host || 'https://api.sendgrid.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v3/user/profile',
    });
  }
}
