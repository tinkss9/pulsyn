// @ts-nocheck
// Dgraph Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'predicates',
    endpoint: '/admin/schema',
    schema: {
      name: 'predicates',
      table: 'predicates',
      columns: [
      { name: 'predicate', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['predicate'],
    },
    idField: 'predicate',
    
  },
];

@registerSource('dgraph')
export class DgraphConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dgraph', 'dgraph', config, {
      baseUrl: config.host || 'http://localhost:8080',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/health',
      
    });
  }
}
