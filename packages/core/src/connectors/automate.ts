// @ts-nocheck
// Automate Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'automations',
    endpoint: '/automations',
    schema: {
      name: 'automations',
      table: 'automations',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('automate')
export class AutomateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'automate', 'automate', config, {
      baseUrl: config.host || 'https://api.automate.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/automations',
      
    });
  }
}
