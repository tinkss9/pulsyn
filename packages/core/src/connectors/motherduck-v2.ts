// @ts-nocheck
// MotherDuck v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/databases/{db}/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('motherduck-v2')
export class MotherDuckv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'motherduck-v2', 'motherduck-v2', config, {
      baseUrl: config.host || 'https://api.motherduck.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/databases',
      
    });
  }
}
