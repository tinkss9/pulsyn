// @ts-nocheck
// Mamut Connector — Auto-generated from config
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

@registerSource('mamut')
export class MamutConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mamut', 'mamut', config, {
      baseUrl: config.host || 'https://api.mamut.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/customers',
      
    });
  }
}
