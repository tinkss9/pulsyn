// @ts-nocheck
// Redis Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'keys',
    endpoint: '/keys',
    schema: {
      name: 'keys',
      table: 'keys',
      columns: [
      { name: 'key', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      { name: 'ttl', type: 'number', nullable: true },
      ],
      primaryKey: ['key'],
    },
    idField: 'key',
    
  },
];

@registerSource('redis')
export class RedisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'redis', 'redis', config, {
      baseUrl: config.host || 'http://localhost:6379',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/ping',
      
    });
  }
}
