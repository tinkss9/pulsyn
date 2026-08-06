// Telegram Bot API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'updates', endpoint: '/getUpdates', schema: { name: 'updates', table: 'updates', columns: [{ name: 'update_id', type: 'number', nullable: false, primaryKey: true }, { name: 'message', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['update_id'] }, idField: 'update_id' }
];

@registerSource('telegram-api')
export class TelegramApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'telegram-api', 'telegram-api', config, {
      baseUrl: config.host || 'https://api.telegram.org/bot{token}',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/getUpdates',
    });
  }
}
