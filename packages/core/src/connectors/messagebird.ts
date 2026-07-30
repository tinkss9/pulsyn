// @ts-nocheck
// MessageBird Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'messages',
    endpoint: '/messages',
    schema: {
      name: 'messages',
      table: 'messages',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'direction', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdDatetime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('messagebird')
export class MessageBirdConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'messagebird', 'messagebird', config, {
      baseUrl: config.host || 'https://rest.messagebird.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/balance',
      
    });
  }
}
