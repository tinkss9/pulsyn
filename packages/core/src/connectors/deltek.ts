// @ts-nocheck
// Deltek Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('deltek')
export class DeltekConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deltek', 'deltek', config, {
      baseUrl: config.host || 'https://api.deltek.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects',
      
    });
  }
}
