// @ts-nocheck
// Keen Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'queries',
    endpoint: '/queries',
    schema: {
      name: 'queries',
      table: 'queries',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('keen')
export class KeenConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'keen', 'keen', config, {
      baseUrl: config.host || 'https://api.keen.io/3.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
