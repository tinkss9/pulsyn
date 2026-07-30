// @ts-nocheck
// Loggly v2 Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      { name: 'event', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('loggly-v2')
export class Logglyv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'loggly-v2', 'loggly-v2', config, {
      baseUrl: config.host || 'https://your-tenant.loggly.com/apiv2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/inputs',
      
    });
  }
}
