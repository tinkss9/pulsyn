// @ts-nocheck
// NZ EA Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'prices',
    endpoint: '/prices',
    schema: {
      name: 'prices',
      table: 'prices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'region', type: 'string', nullable: true },
      { name: 'price', type: 'number', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('nz-ea')
export class NZEAConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nz-ea', 'nz-ea', config, {
      baseUrl: config.host || 'https://api.ea.govt.nz/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/prices',
      
    });
  }
}
