// @ts-nocheck
// Turnitin Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'submissions',
    endpoint: '/submissions',
    schema: {
      name: 'submissions',
      table: 'submissions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('turnitin')
export class TurnitinConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'turnitin', 'turnitin', config, {
      baseUrl: config.host || 'https://api.turnitin.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/submissions',
      
    });
  }
}
