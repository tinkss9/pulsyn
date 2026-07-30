// @ts-nocheck
// MessageBird CC Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/calls',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('messagebird-cc')
export class MessageBirdCCConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'messagebird-cc', 'messagebird-cc', config, {
      baseUrl: config.host || 'https://voice.messagebird.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/calls',
      
    });
  }
}
