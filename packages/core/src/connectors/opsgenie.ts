// @ts-nocheck
// Opsgenie Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'alerts',
    endpoint: '/alerts',
    schema: {
      name: 'alerts',
      table: 'alerts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'message', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('opsgenie')
export class OpsgenieConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opsgenie', 'opsgenie', config, {
      baseUrl: config.host || 'https://api.opsgenie.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users/me',
      
    });
  }
}
