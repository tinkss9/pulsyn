// @ts-nocheck
// Plivo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/Account/{authId}/Message',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'message_uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'from_number', type: 'string', nullable: true },
      { name: 'to_number', type: 'string', nullable: true },
      { name: 'message_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['message_uuid'],
    },
    idField: 'message_uuid',
    
  },
];

@registerSource('plivo')
export class PlivoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plivo', 'plivo', config, {
      baseUrl: config.host || 'https://api.plivo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Account',
      
    });
  }
}
