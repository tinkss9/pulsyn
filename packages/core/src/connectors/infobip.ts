// @ts-nocheck
// Infobip Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/logs',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'messageId', type: 'string', nullable: false, primaryKey: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'sentAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['messageId'],
    },
    idField: 'messageId',
    
  },
];

@registerSource('infobip')
export class InfobipConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'infobip', 'infobip', config, {
      baseUrl: config.host || 'https://api.infobip.com/sms/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/logs',
      
    });
  }
}
