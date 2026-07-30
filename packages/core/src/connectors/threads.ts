// @ts-nocheck
// Threads Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/me/threads',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('threads')
export class ThreadsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'threads', 'threads', config, {
      baseUrl: config.host || 'https://graph.threads.net/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
