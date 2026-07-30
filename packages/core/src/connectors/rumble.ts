// @ts-nocheck
// Rumble Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'assets',
    endpoint: '/assets',
    schema: {
      name: 'assets',
      table: 'assets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'addresses', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('rumble')
export class RumbleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rumble', 'rumble', config, {
      baseUrl: config.host || 'https://console.rumble.run/api/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/assets',
      
    });
  }
}
