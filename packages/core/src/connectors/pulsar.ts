// @ts-nocheck
// Apache Pulsar Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tenants',
    endpoint: '/tenants',
    schema: {
      name: 'tenants',
      table: 'tenants',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
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

@registerSource('pulsar')
export class ApachePulsarConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pulsar', 'pulsar', config, {
      baseUrl: config.host || 'http://localhost:8080/admin/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/brokers/healthcheck',
      
    });
  }
}
