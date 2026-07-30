// @ts-nocheck
// Balsamiq Connector — Auto-generated from config
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

@registerSource('balsamiq')
export class BalsamiqConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'balsamiq', 'balsamiq', config, {
      baseUrl: config.host || 'https://api.balsamiq.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects',
      
    });
  }
}
