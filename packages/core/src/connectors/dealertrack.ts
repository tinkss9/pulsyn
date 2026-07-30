// @ts-nocheck
// Dealertrack Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'vehicles',
    endpoint: '/vehicles',
    schema: {
      name: 'vehicles',
      table: 'vehicles',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'vin', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('dealertrack')
export class DealertrackConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dealertrack', 'dealertrack', config, {
      baseUrl: config.host || 'https://api.dealertrack.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/vehicles',
      
    });
  }
}
