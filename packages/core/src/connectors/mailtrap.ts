// @ts-nocheck
// Mailtrap Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/api/accounts/{accountId}/inboxes/{inboxId}/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'from_email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mailtrap')
export class MailtrapConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mailtrap', 'mailtrap', config, {
      baseUrl: config.host || 'https://mailtrap.io/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/accounts',
      
    });
  }
}
