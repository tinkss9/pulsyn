// @ts-nocheck
// Turbo SMTP Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'mails',
    endpoint: '/mails',
    schema: {
      name: 'mails',
      table: 'mails',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'sent_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('turbo-smtp')
export class TurboSMTPConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'turbo-smtp', 'turbo-smtp', config, {
      baseUrl: config.host || 'https://api.turbo-smtp.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/account',
      
    });
  }
}
