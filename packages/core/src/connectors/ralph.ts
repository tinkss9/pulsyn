// @ts-nocheck
// Ralph Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'assets',
    endpoint: '/assets',
    schema: {
      name: 'assets',
      table: 'assets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('ralph')
export class RalphConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ralph', 'ralph', config, {
      baseUrl: config.host || 'https://api.ralph.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/assets',
      
    });
  }
}
