// @ts-nocheck
// Postmark v2 Connector — Auto-generated from config
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

@registerSource('postmark-v2')
export class Postmarkv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'postmark-v2', 'postmark-v2', config, {
      baseUrl: config.host || 'https://api.postmarkapp.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/server',
      
    });
  }
}
