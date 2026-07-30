// @ts-nocheck
// Buffer Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/updates',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('buffer')
export class BufferConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'buffer', 'buffer', config, {
      baseUrl: config.host || 'https://api.bufferapp.com/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/profiles',
      
    });
  }
}
