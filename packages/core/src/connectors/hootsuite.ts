// @ts-nocheck
// Hootsuite Connector — Auto-generated from config
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
      { name: 'text', type: 'string', nullable: true },
      { name: 'scheduledSendTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('hootsuite')
export class HootsuiteConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hootsuite', 'hootsuite', config, {
      baseUrl: config.host || 'https://platform.hootsuite.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
