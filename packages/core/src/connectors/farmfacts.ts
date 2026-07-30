// @ts-nocheck
// FarmFacts Connector — Auto-generated from config
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

@registerSource('farmfacts')
export class FarmFactsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'farmfacts', 'farmfacts', config, {
      baseUrl: config.host || 'https://api.farmfacts.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/fields',
      
    });
  }
}
