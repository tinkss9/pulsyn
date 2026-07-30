// @ts-nocheck
// Cloudbeds Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reservations',
    endpoint: '/getReservations',
    schema: {
      name: 'reservations',
      table: 'reservations',
      columns: [
      { name: 'reservationID', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'checkin', type: 'date', nullable: true },
      ],
      primaryKey: ['reservationID'],
    },
    idField: 'reservationID',
    
  },
];

@registerSource('cloudbeds')
export class CloudbedsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cloudbeds', 'cloudbeds', config, {
      baseUrl: config.host || 'https://api.cloudbeds.com/api/v1.2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/getHotels',
      
    });
  }
}
