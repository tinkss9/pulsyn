// @ts-nocheck
// MRPeasy Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'items',
    endpoint: '/items',
    schema: {
      name: 'items',
      table: 'items',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mrpeasy')
export class MRPeasyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mrpeasy', 'mrpeasy', config, {
      baseUrl: config.host || 'https://api.mrpeasy.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/items',
      
    });
  }
}
