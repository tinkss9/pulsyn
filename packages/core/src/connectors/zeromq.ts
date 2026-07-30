// @ts-nocheck
// ZeroMQ Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'topics',
    endpoint: '/topics',
    schema: {
      name: 'topics',
      table: 'topics',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('zeromq')
export class ZeroMQConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zeromq', 'zeromq', config, {
      baseUrl: config.host || 'http://localhost:5555',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
