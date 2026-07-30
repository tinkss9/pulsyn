// @ts-nocheck
// Gusto Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'employees',
    endpoint: '/v1/companies/{company_id}/employees',
    schema: {
      name: 'employees',
      table: 'employees',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gusto')
export class GustoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gusto', 'gusto', config, {
      baseUrl: config.host || 'https://api.gusto.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v1/me',
      
    });
  }
}
