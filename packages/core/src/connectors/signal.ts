// @ts-nocheck
// Signal Connector — Auto-generated from config
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
      { name: 'timestamp', type: 'string', nullable: false, primaryKey: true },
      { name: 'source', type: 'string', nullable: true },
      { name: 'message', type: 'string', nullable: true },
      ],
      primaryKey: ['timestamp'],
    },
    idField: 'timestamp',
    
  },
];

@registerSource('signal')
export class SignalConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'signal', 'signal', config, {
      baseUrl: config.host || 'http://localhost:8080/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/about',
      
    });
  }
}
