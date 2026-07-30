// @ts-nocheck
// SocketLabs Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('socketlabs')
export class SocketLabsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'socketlabs', 'socketlabs', config, {
      baseUrl: config.host || 'https://api.socketlabs.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/servers',
      
    });
  }
}
