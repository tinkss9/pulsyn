// @ts-nocheck
// Vonage CC Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'direction', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uuid'],
    },
    idField: 'uuid',
    
  },
];

@registerSource('vonage-cc')
export class VonageCCConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vonage-cc', 'vonage-cc', config, {
      baseUrl: config.host || 'https://api.nexmo.com/v1/calls',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
