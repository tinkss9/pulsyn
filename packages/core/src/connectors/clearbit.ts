// @ts-nocheck
// Clearbit Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'companies',
    endpoint: '/companies/find',
    schema: {
      name: 'companies',
      table: 'companies',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      { name: 'description', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('clearbit')
export class ClearbitConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clearbit', 'clearbit', config, {
      baseUrl: config.host || 'https://company.clearbit.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/companies/find?domain=google.com',
      
    });
  }
}
