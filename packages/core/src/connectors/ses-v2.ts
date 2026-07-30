// @ts-nocheck
// Amazon SES v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/v2/email/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'ContactIdentity', type: 'string', nullable: false, primaryKey: true },
      { name: 'EmailAddress', type: 'string', nullable: true },
      ],
      primaryKey: ['ContactIdentity'],
    },
    idField: 'ContactIdentity',
    
  },
];

@registerSource('ses-v2')
export class AmazonSESv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ses-v2', 'ses-v2', config, {
      baseUrl: config.host || 'https://email.us-east-1.amazonaws.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/email',
      
    });
  }
}
