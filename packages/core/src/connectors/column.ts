// @ts-nocheck
// Column Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('column')
export class ColumnConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'column', 'column', config, {
      baseUrl: config.host || 'https://api.column.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts',
      
    });
  }
}
