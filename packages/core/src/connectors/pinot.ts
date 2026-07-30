// @ts-nocheck
// Apache Pinot Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('pinot')
export class ApachePinotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pinot', 'pinot', config, {
      baseUrl: config.host || 'http://localhost:9000',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/tables',
      
    });
  }
}
