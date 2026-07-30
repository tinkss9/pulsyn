// @ts-nocheck
// RethinkDB Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/ajax/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('rethinkdb')
export class RethinkDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rethinkdb', 'rethinkdb', config, {
      baseUrl: config.host || 'http://localhost:8080',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/ajax/dashboard',
      
    });
  }
}
