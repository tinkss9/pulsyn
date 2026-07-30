// @ts-nocheck
// Galera Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'nodes',
    endpoint: '/nodes',
    schema: {
      name: 'nodes',
      table: 'nodes',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('galera')
export class GaleraConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'galera', 'galera', config, {
      baseUrl: config.host || 'http://localhost:3306',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
