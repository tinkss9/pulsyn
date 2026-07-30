// @ts-nocheck
// MailerLite Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'subscribers',
    endpoint: '/subscribers',
    schema: {
      name: 'subscribers',
      table: 'subscribers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mailerlite')
export class MailerLiteConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mailerlite', 'mailerlite', config, {
      baseUrl: config.host || 'https://connect.mailerlite.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/subscribers',
      
    });
  }
}
