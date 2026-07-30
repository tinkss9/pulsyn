// @ts-nocheck
// Twilio Verify Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'verifications',
    endpoint: '/Services/{ServiceSid}/Verifications',
    schema: {
      name: 'verifications',
      table: 'verifications',
      columns: [
      { name: 'sid', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['sid'],
    },
    idField: 'sid',
    
  },
];

@registerSource('twillio-verify')
export class TwilioVerifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twillio-verify', 'twillio-verify', config, {
      baseUrl: config.host || 'https://verify.twilio.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Services',
      
    });
  }
}
