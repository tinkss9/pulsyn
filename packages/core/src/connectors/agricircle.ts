// @ts-nocheck
// Agricircle Connector — Auto-generated from config
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

@registerSource('agricircle')
export class AgricircleConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'agricircle', 'agricircle', config, {
      baseUrl: config.host || 'https://api.agricircle.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/fields',
      
    });
  }
}
