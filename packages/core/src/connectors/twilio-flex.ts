// @ts-nocheck
// Twilio Flex Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'channels',
    endpoint: '/Channels',
    schema: {
      name: 'channels',
      table: 'channels',
      columns: [
      { name: 'sid', type: 'string', nullable: false, primaryKey: true },
      { name: 'friendly_name', type: 'string', nullable: true },
      ],
      primaryKey: ['sid'],
    },
    idField: 'sid',
    
  },
];

@registerSource('twilio-flex')
export class TwilioFlexConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twilio-flex', 'twilio-flex', config, {
      baseUrl: config.host || 'https://flex-api.twilio.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Channels',
      
    });
  }
}
