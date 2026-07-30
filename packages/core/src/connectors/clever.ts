// @ts-nocheck
// Clever Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'students',
    endpoint: '/students',
    schema: {
      name: 'students',
      table: 'students',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'object', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('clever')
export class CleverConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clever', 'clever', config, {
      baseUrl: config.host || 'https://api.clever.com/v3.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
