// @ts-nocheck
// Katapult Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'virtual_machines',
    endpoint: '/virtual_machines',
    schema: {
      name: 'virtual_machines',
      table: 'virtual_machines',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'hostname', type: 'string', nullable: true },
      { name: 'state', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('katapult')
export class KatapultConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'katapult', 'katapult', config, {
      baseUrl: config.host || 'https://api.katapult.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/virtual_machines',
      
    });
  }
}
