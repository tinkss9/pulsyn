// @ts-nocheck
// Mailchimp Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'lists', endpoint: '/3.0/lists', schema: { name: 'lists', table: 'lists', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'member_count', type: 'number', nullable: true }, { name: 'date_created', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'date_created' },
  { name: 'members', endpoint: '/3.0/lists/{list_id}/members', schema: { name: 'members', table: 'members', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'email_address', type: 'string', nullable: false },
    { name: 'status', type: 'string', nullable: false }, { name: 'first_name', type: 'string', nullable: true },
    { name: 'last_name', type: 'string', nullable: true }, { name: 'timestamp_signup', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'last_changed' },
];

@registerSource('mailchimp')
export class MailchimpConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mailchimp', 'mailchimp', config, {
      baseUrl: config.host || 'https://us1.api.mailchimp.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/3.0/ping',
    });
  }
}
