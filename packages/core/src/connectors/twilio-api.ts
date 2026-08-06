// Twilio API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'messages', endpoint: '/Accounts/{id}/Messages.json?PageSize=20', schema: { name: 'messages', table: 'messages', columns: [{ name: 'sid', type: 'string', nullable: false, primaryKey: true }, { name: 'to', type: 'string', nullable: false, primaryKey: false }, { name: 'from', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }, { name: 'body', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['sid'] }, idField: 'sid' },
{ name: 'calls', endpoint: '/Accounts/{id}/Calls.json?PageSize=20', schema: { name: 'calls', table: 'calls', columns: [{ name: 'sid', type: 'string', nullable: false, primaryKey: true }, { name: 'to', type: 'string', nullable: false, primaryKey: false }, { name: 'from', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['sid'] }, idField: 'sid' }
];

@registerSource('twilio-api')
export class TwilioApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twilio-api', 'twilio-api', config, {
      baseUrl: config.host || 'https://api.twilio.com/2010-04-01',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Accounts/{id}/Messages.json',
    });
  }
}
