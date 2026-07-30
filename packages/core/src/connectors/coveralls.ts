// @ts-nocheck
// Coveralls Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repos',
    endpoint: '/github/{owner}/repos',
    schema: {
      name: 'repos',
      table: 'repos',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'coverage', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('coveralls')
export class CoverallsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coveralls', 'coveralls', config, {
      baseUrl: config.host || 'https://coveralls.io/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
