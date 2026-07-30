// @ts-nocheck
// Tyler Technologies Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'records',
    endpoint: '/records',
    schema: {
      name: 'records',
      table: 'records',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('tyler-tech')
export class TylerTechnologiesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tyler-tech', 'tyler-tech', config, {
      baseUrl: config.host || 'https://api.tylertech.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/records',
      
    });
  }
}
