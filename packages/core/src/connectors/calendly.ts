// @ts-nocheck
// Calendly Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/scheduled_events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'uri', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uri'],
    },
    idField: 'uri',
    
  },
];

@registerSource('calendly')
export class CalendlyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'calendly', 'calendly', config, {
      baseUrl: config.host || 'https://api.calendly.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/me',
      
    });
  }
}
