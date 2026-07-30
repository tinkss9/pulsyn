// @ts-nocheck
// Facebook Messenger Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'conversations',
    endpoint: '/me/conversations',
    schema: {
      name: 'conversations',
      table: 'conversations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'snippet', type: 'string', nullable: true },
      { name: 'updated_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_time',
  },
];

@registerSource('messenger')
export class FacebookMessengerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'messenger', 'messenger', config, {
      baseUrl: config.host || 'https://graph.facebook.com/v18.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
