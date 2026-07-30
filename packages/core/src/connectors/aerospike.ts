// @ts-nocheck
// Aerospike Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'namespaces',
    endpoint: '/namespaces',
    schema: {
      name: 'namespaces',
      table: 'namespaces',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('aerospike')
export class AerospikeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aerospike', 'aerospike', config, {
      baseUrl: config.host || 'http://localhost:3000/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cluster',
      
    });
  }
}
