// @ts-nocheck
// Glofox Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'members',
    endpoint: '/members',
    schema: {
      name: 'members',
      table: 'members',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('glofox')
export class GlofoxConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'glofox', 'glofox', config, {
      baseUrl: config.host || 'https://api.glofox.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/members',
      
    });
  }
}
