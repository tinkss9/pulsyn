// @ts-nocheck
// Neo4j Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'nodes',
    endpoint: '/tx/commit',
    schema: {
      name: 'nodes',
      table: 'nodes',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'labels', type: 'object', nullable: true },
      { name: 'properties', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('neo4j')
export class Neo4jConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'neo4j', 'neo4j', config, {
      baseUrl: config.host || 'http://localhost:7474/db/neo4j',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tx',
      
    });
  }
}
