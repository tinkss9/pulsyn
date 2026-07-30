// @ts-nocheck
// ThingsBoard Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/tenant/devices',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'object', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('thingsboard')
export class ThingsBoardConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thingsboard', 'thingsboard', config, {
      baseUrl: config.host || 'https://your-thingsboard.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tenant/devices',
      
    });
  }
}
