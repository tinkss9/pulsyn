// @ts-nocheck
// HomeNet Connector — Auto-generated from config
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
      { name: 'make', type: 'string', nullable: true },
      { name: 'model', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('homenet')
export class HomeNetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'homenet', 'homenet', config, {
      baseUrl: config.host || 'https://api.homenet.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/vehicles',
      
    });
  }
}
