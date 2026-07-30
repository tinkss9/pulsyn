// @ts-nocheck
// Gab Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/timelines/home',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'content', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gab')
export class GabConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gab', 'gab', config, {
      baseUrl: config.host || 'https://api.gab.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
