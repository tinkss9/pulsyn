// @ts-nocheck
// Mixpanel v3 Connector — Auto-generated from config
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
      { name: 'event', type: 'string', nullable: false, primaryKey: true },
      { name: 'count', type: 'number', nullable: true },
      ],
      primaryKey: ['event'],
    },
    idField: 'event',
    
  },
];

@registerSource('mixpanel-v3')
export class Mixpanelv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mixpanel-v3', 'mixpanel-v3', config, {
      baseUrl: config.host || 'https://mixpanel.com/api/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/events',
      
    });
  }
}
