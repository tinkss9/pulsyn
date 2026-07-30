// @ts-nocheck
// MotherDuck Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('motherduck')
export class MotherDuckConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'motherduck', 'motherduck', config, {
      baseUrl: config.host || 'https://api.motherduck.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/databases',
      
    });
  }
}
