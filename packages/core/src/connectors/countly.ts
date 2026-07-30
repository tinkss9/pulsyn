// @ts-nocheck
// Countly Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'apps',
    endpoint: '/apps/all',
    schema: {
      name: 'apps',
      table: 'apps',
      columns: [
      { name: '_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
    
  },
];

@registerSource('countly')
export class CountlyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'countly', 'countly', config, {
      baseUrl: config.host || 'https://your-countly.com/o',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/apps/all',
      
    });
  }
}
