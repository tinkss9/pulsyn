// @ts-nocheck
// Epicor Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'customers',
    endpoint: '/customers',
    schema: {
      name: 'customers',
      table: 'customers',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('epicor')
export class EpicorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'epicor', 'epicor', config, {
      baseUrl: config.host || 'https://api.epicor.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
