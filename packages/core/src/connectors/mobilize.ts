// @ts-nocheck
// Mobilize Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'created_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mobilize')
export class MobilizeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mobilize', 'mobilize', config, {
      baseUrl: config.host || 'https://api.mobilize.us/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/events',
      
    });
  }
}
