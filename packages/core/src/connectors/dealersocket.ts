// @ts-nocheck
// DealerSocket Connector — Auto-generated from config
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

@registerSource('dealersocket')
export class DealerSocketConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dealersocket', 'dealersocket', config, {
      baseUrl: config.host || 'https://api.dealersocket.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/vehicles',
      
    });
  }
}
