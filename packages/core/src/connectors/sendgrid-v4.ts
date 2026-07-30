// @ts-nocheck
// SendGrid v4 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/marketing/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: false },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sendgrid-v4')
export class SendGridv4Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sendgrid-v4', 'sendgrid-v4', config, {
      baseUrl: config.host || 'https://api.sendgrid.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/user/profile',
      
    });
  }
}
