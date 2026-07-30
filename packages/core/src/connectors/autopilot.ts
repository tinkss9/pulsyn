// @ts-nocheck
// Autopilot Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'contact_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'Email', type: 'string', nullable: true },
      { name: 'FirstName', type: 'string', nullable: true },
      { name: 'LastName', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['contact_id'],
    },
    idField: 'contact_id',
    
  },
];

@registerSource('autopilot')
export class AutopilotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'autopilot', 'autopilot', config, {
      baseUrl: config.host || 'https://api2.autopilothq.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/contacts',
      
    });
  }
}
