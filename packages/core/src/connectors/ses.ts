// @ts-nocheck
// Amazon SES Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'templates',
    endpoint: '/v2/email/templates',
    schema: {
      name: 'templates',
      table: 'templates',
      columns: [
      { name: 'TemplateName', type: 'string', nullable: false, primaryKey: true },
      { name: 'CreatedTimestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['TemplateName'],
    },
    idField: 'TemplateName',
    
  },
];

@registerSource('ses')
export class AmazonSESConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ses', 'ses', config, {
      baseUrl: config.host || 'https://email.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
      
    });
  }
}
