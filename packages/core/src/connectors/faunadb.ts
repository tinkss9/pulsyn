// @ts-nocheck
// FaunaDB Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'collections',
    endpoint: '/collections',
    schema: {
      name: 'collections',
      table: 'collections',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'coll', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('faunadb')
export class FaunaDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'faunadb', 'faunadb', config, {
      baseUrl: config.host || 'https://db.fauna.com/db',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
