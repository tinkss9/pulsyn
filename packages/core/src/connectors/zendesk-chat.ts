// @ts-nocheck
// Zendesk Chat Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'chats',
    endpoint: '/chats',
    schema: {
      name: 'chats',
      table: 'chats',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'visitor', type: 'object', nullable: true },
      { name: 'started_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zendesk-chat')
export class ZendeskChatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zendesk-chat', 'zendesk-chat', config, {
      baseUrl: config.host || 'https://www.zopim.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/chats',
      
    });
  }
}
