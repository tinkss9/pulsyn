// @ts-nocheck
// Plivo CC Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'calls',
    endpoint: '/Account/{authId}/Call',
    schema: {
      name: 'calls',
      table: 'calls',
      columns: [
      { name: 'call_uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'from_number', type: 'string', nullable: true },
      { name: 'to_number', type: 'string', nullable: true },
      { name: 'call_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['call_uuid'],
    },
    idField: 'call_uuid',
    
  },
];

@registerSource('plivo-cc')
export class PlivoCCConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plivo-cc', 'plivo-cc', config, {
      baseUrl: config.host || 'https://api.plivo.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/Account',
      
    });
  }
}
