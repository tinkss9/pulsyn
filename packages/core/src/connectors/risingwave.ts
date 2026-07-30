// @ts-nocheck
// RisingWave Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clusters',
    endpoint: '/clusters',
    schema: {
      name: 'clusters',
      table: 'clusters',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('risingwave')
export class RisingWaveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'risingwave', 'risingwave', config, {
      baseUrl: config.host || 'https://api.risingwave.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clusters',
      
    });
  }
}
