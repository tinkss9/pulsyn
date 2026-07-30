// @ts-nocheck
// OpenGov Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'budgets',
    endpoint: '/budgets',
    schema: {
      name: 'budgets',
      table: 'budgets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('opengov')
export class OpenGovConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opengov', 'opengov', config, {
      baseUrl: config.host || 'https://api.opengov.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/budgets',
      
    });
  }
}
