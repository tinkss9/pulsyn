// @ts-nocheck
// Postmark Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/messages/outbound',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'MessageID', type: 'string', nullable: false, primaryKey: true },
      { name: 'Subject', type: 'string', nullable: true },
      { name: 'ReceivedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['MessageID'],
    },
    idField: 'MessageID',
    
  },
];

@registerSource('postmark')
export class PostmarkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'postmark', 'postmark', config, {
      baseUrl: config.host || 'https://api.postmarkapp.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/server',
      
    });
  }
}
