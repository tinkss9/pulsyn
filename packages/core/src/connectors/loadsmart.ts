// @ts-nocheck
// Loadsmart Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'loads',
    endpoint: '/loads',
    schema: {
      name: 'loads',
      table: 'loads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('loadsmart')
export class LoadsmartConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'loadsmart', 'loadsmart', config, {
      baseUrl: config.host || 'https://api.loadsmart.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/loads',
      
    });
  }
}
