// @ts-nocheck
// Papertrail Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'events',
    endpoint: '/events/search',
    schema: {
      name: 'events',
      table: 'events',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'message', type: 'string', nullable: true },
      { name: 'received_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('papertrail')
export class PapertrailConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'papertrail', 'papertrail', config, {
      baseUrl: config.host || 'https://papertrailapp.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/systems',
      
    });
  }
}
