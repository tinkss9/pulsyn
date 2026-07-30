// @ts-nocheck
// Amadeus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flights',
    endpoint: '/shopping/flight-offers',
    schema: {
      name: 'flights',
      table: 'flights',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'price', type: 'object', nullable: true },
      { name: 'itineraries', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('amadeus')
export class AmadeusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'amadeus', 'amadeus', config, {
      baseUrl: config.host || 'https://api.amadeus.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/reference-data/locations',
      
    });
  }
}
