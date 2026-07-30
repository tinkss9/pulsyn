// @ts-nocheck
// Little Green Light Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'constituents',
    endpoint: '/constituents',
    schema: {
      name: 'constituents',
      table: 'constituents',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('little-green-light')
export class LittleGreenLightConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'little-green-light', 'little-green-light', config, {
      baseUrl: config.host || 'https://api.littlegreenlight.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/constituents',
      
    });
  }
}
