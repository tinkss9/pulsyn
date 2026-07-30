// @ts-nocheck
// Traction Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/jobs',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('traction')
export class TractionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'traction', 'traction', config, {
      baseUrl: config.host || 'https://api.traction.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/jobs',
      
    });
  }
}
