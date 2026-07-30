// @ts-nocheck
// Snowplow Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/events',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'event_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'event_name', type: 'string', nullable: true },
      { name: 'derived_tstamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['event_id'],
    },
    idField: 'event_id',
    
  },
];

@registerSource('snowplow')
export class SnowplowConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'snowplow', 'snowplow', config, {
      baseUrl: config.host || 'https://your-snowplow.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/micro/health',
      
    });
  }
}
