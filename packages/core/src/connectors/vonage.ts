// @ts-nocheck
// Vonage Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/search/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'message-id', type: 'string', nullable: false, primaryKey: true },
      { name: 'to', type: 'string', nullable: true },
      { name: 'from', type: 'string', nullable: true },
      { name: 'date-received', type: 'datetime', nullable: true },
      ],
      primaryKey: ['message-id'],
    },
    idField: 'message-id',
    
  },
];

@registerSource('vonage')
export class VonageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vonage', 'vonage', config, {
      baseUrl: config.host || 'https://rest.nexmo.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account/get-balance',
      
    });
  }
}
