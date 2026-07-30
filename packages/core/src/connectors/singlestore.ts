// @ts-nocheck
// SingleStore Connector — Auto-generated from config
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
      { name: 'databaseID', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['databaseID'],
    },
    idField: 'databaseID',
    
  },
];

@registerSource('singlestore')
export class SingleStoreConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'singlestore', 'singlestore', config, {
      baseUrl: config.host || 'https://api.singlestore.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/workspaces',
      
    });
  }
}
