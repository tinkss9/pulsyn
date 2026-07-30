// @ts-nocheck
// Airbnb Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reservations',
    endpoint: '/reservations',
    schema: {
      name: 'reservations',
      table: 'reservations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'checkin', type: 'date', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('airbnb')
export class AirbnbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'airbnb', 'airbnb', config, {
      baseUrl: config.host || 'https://api.airbnb.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/reservations',
      
    });
  }
}
