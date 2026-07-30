// @ts-nocheck
// Telegram Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'updates',
    endpoint: '/getUpdates',
    schema: {
      name: 'updates',
      table: 'updates',
      columns: [
      { name: 'update_id', type: 'number', nullable: false, primaryKey: true },
      { name: 'message', type: 'object', nullable: true },
      { name: 'date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['update_id'],
    },
    idField: 'update_id',
    
  },
];

@registerSource('telegram')
export class TelegramConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'telegram', 'telegram', config, {
      baseUrl: config.host || 'https://api.telegram.org/bot{token}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/getMe',
      
    });
  }
}
