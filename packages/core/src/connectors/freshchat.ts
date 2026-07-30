// @ts-nocheck
// Freshchat Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('freshchat')
export class FreshchatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'freshchat', 'freshchat', config, {
      baseUrl: config.host || 'https://your-domain.freshchat.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/agents',
      
    });
  }
}
