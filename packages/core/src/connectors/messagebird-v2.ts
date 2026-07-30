// @ts-nocheck
// MessageBird v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'conversations',
    endpoint: '/conversations',
    schema: {
      name: 'conversations',
      table: 'conversations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdDatetime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('messagebird-v2')
export class MessageBirdv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'messagebird-v2', 'messagebird-v2', config, {
      baseUrl: config.host || 'https://rest.messagebird.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/balance',
      
    });
  }
}
