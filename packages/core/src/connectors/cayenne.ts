// @ts-nocheck
// Cayenne Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'devices',
    endpoint: '/devices',
    schema: {
      name: 'devices',
      table: 'devices',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('cayenne')
export class CayenneConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cayenne', 'cayenne', config, {
      baseUrl: config.host || 'https://api.cayenne.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/devices',
      
    });
  }
}
