// @ts-nocheck
// Snowflake v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'warehouses',
    endpoint: '/warehouses',
    schema: {
      name: 'warehouses',
      table: 'warehouses',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'size', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('snowflake-v3')
export class Snowflakev3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'snowflake-v3', 'snowflake-v3', config, {
      baseUrl: config.host || 'https://your-account.snowflakecomputing.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/queries',
      
    });
  }
}
