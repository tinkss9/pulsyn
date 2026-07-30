// @ts-nocheck
// Conservis Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'fields',
    endpoint: '/fields',
    schema: {
      name: 'fields',
      table: 'fields',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('conservis')
export class ConservisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'conservis', 'conservis', config, {
      baseUrl: config.host || 'https://api.conservis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/fields',
      
    });
  }
}
