// @ts-nocheck
// Memgraph Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'nodes',
    endpoint: '/nodes',
    schema: {
      name: 'nodes',
      table: 'nodes',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'labels', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('memgraph')
export class MemgraphConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'memgraph', 'memgraph', config, {
      baseUrl: config.host || 'http://localhost:7687',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
