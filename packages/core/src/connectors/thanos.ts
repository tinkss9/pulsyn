// @ts-nocheck
// Thanos Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'targets',
    endpoint: '/targets',
    schema: {
      name: 'targets',
      table: 'targets',
      columns: [
      { name: 'scrapeUrl', type: 'string', nullable: false, primaryKey: true },
      { name: 'health', type: 'string', nullable: true },
      ],
      primaryKey: ['scrapeUrl'],
    },
    idField: 'scrapeUrl',
    
  },
];

@registerSource('thanos')
export class ThanosConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thanos', 'thanos', config, {
      baseUrl: config.host || 'http://localhost:10902/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status/config',
      
    });
  }
}
