// @ts-nocheck
// Travelport Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/flights',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'price', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('travelport')
export class TravelportConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'travelport', 'travelport', config, {
      baseUrl: config.host || 'https://api.travelport.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/flights',
      
    });
  }
}
