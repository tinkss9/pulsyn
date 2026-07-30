// @ts-nocheck
// Mailjet Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/REST/contact',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'ID', type: 'number', nullable: false, primaryKey: true },
      { name: 'Email', type: 'string', nullable: true },
      { name: 'Name', type: 'string', nullable: true },
      { name: 'CreatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['ID'],
    },
    idField: 'ID',
    
  },
];

@registerSource('mailjet')
export class MailjetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mailjet', 'mailjet', config, {
      baseUrl: config.host || 'https://api.mailjet.com/v3.1',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/REST/contact',
      
    });
  }
}
