// @ts-nocheck
// LiveChat Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'chats',
    endpoint: '/agent/action/list_chats',
    schema: {
      name: 'chats',
      table: 'chats',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('livechat')
export class LiveChatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'livechat', 'livechat', config, {
      baseUrl: config.host || 'https://api.livechatinc.com/v3.5',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/configuration',
      
    });
  }
}
