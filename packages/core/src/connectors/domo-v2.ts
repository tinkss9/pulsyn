// @ts-nocheck
// Domo v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'datasets',
    endpoint: '/datasets',
    schema: {
      name: 'datasets',
      table: 'datasets',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'rows', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('domo-v2')
export class Domov2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'domo-v2', 'domo-v2', config, {
      baseUrl: config.host || 'https://api.domo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/datasets',
      
    });
  }
}
