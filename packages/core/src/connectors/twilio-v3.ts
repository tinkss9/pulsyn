// @ts-nocheck
// Twilio v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'sid', type: 'string', nullable: false, primaryKey: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'from', type: 'string', nullable: true },
      { name: 'date_sent', type: 'datetime', nullable: true },
      ],
      primaryKey: ['sid'],
    },
    idField: 'sid',
    
  },
];

@registerSource('twilio-v3')
export class Twiliov3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twilio-v3', 'twilio-v3', config, {
      baseUrl: config.host || 'https://api.twilio.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/2010-04-01/Accounts.json',
      
    });
  }
}
