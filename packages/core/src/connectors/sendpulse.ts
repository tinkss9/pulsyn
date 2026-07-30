// @ts-nocheck
// SendPulse Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/addressbooks/{bookId}/emails',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sendpulse')
export class SendPulseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sendpulse', 'sendpulse', config, {
      baseUrl: config.host || 'https://api.sendpulse.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/addressbooks',
      
    });
  }
}
