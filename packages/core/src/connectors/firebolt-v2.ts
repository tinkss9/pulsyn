// @ts-nocheck
// Firebolt v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/core/v1/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('firebolt-v2')
export class Fireboltv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'firebolt-v2', 'firebolt-v2', config, {
      baseUrl: config.host || 'https://api.firebolt.io',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/core/v1/account',
      
    });
  }
}
