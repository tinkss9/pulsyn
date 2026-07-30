// @ts-nocheck
// Codecov Connector — Auto-generated from config
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
      { name: 'updatestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('codecov')
export class CodecovConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'codecov', 'codecov', config, {
      baseUrl: config.host || 'https://api.codecov.io/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
