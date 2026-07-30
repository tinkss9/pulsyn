// @ts-nocheck
// CrateDB Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/_sql',
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

@registerSource('cratedb')
export class CrateDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cratedb', 'cratedb', config, {
      baseUrl: config.host || 'http://localhost:4200',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
      
    });
  }
}
