// SendGrid API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'messages', endpoint: '/messages?limit=20', schema: { name: 'messages', table: 'messages', columns: [{ name: 'msg_id', type: 'string', nullable: false, primaryKey: true }, { name: 'from_email', type: 'string', nullable: false, primaryKey: false }, { name: 'to_email', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['msg_id'] }, idField: 'msg_id' }
];

@registerSource('sendgrid-api')
export class SendgridApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sendgrid-api', 'sendgrid-api', config, {
      baseUrl: config.host || 'https://api.sendgrid.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/messages',
    });
  }
}
