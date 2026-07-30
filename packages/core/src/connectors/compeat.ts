// @ts-nocheck
// Compeat Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'employees',
    endpoint: '/employees',
    schema: {
      name: 'employees',
      table: 'employees',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('compeat')
export class CompeatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'compeat', 'compeat', config, {
      baseUrl: config.host || 'https://api.compeat.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/employees',
      
    });
  }
}
