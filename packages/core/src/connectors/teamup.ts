// @ts-nocheck
// Teamup Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/calendars/{calendarKey}/events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'start_dt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('teamup')
export class TeamupConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'teamup', 'teamup', config, {
      baseUrl: config.host || 'https://api.teamup.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/calendars',
      
    });
  }
}
