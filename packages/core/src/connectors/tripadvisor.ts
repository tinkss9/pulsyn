// @ts-nocheck
// TripAdvisor Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reviews',
    endpoint: '/location/{locationId}/reviews',
    schema: {
      name: 'reviews',
      table: 'reviews',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'published_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('tripadvisor')
export class TripAdvisorConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tripadvisor', 'tripadvisor', config, {
      baseUrl: config.host || 'https://api.tripadvisor.com/api/partner/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/locations',
      
    });
  }
}
