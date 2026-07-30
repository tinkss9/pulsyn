// @ts-nocheck
// Blackbaud Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'constituents',
    endpoint: '/constituents/v2/constituents',
    schema: {
      name: 'constituents',
      table: 'constituents',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('blackbaud')
export class BlackbaudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'blackbaud', 'blackbaud', config, {
      baseUrl: config.host || 'https://api.sky.blackbaud.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/constituents/v2/constituents',
      
    });
  }
}
