// @ts-nocheck
// Couchbase Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/pools/default/buckets',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      { name: 'items', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('couchbase')
export class CouchbaseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'couchbase', 'couchbase', config, {
      baseUrl: config.host || 'http://localhost:8091',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/pools',
      
    });
  }
}
