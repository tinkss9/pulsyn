// @ts-nocheck
// Copper Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/api/v1/people/search',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
  {
    name: 'companies',
    endpoint: '/api/v1/companies/search',
    schema: {
      name: 'companies',
      table: 'companies',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
  {
    name: 'opportunities',
    endpoint: '/api/v1/opportunities/search',
    schema: {
      name: 'opportunities',
      table: 'opportunities',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'monetary_value', type: 'number', nullable: true },
      { name: 'close_date', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('copper')
export class CopperConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'copper', 'copper', config, {
      baseUrl: config.host || 'https://api.copper.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/v1/user/me',
      
    });
  }
}
