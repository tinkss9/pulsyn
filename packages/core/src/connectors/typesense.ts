// @ts-nocheck
// Typesense Connector — Auto-generated from config
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
      { name: 'num_documents', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('typesense')
export class TypesenseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'typesense', 'typesense', config, {
      baseUrl: config.host || 'http://localhost:8108',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/health',
      
    });
  }
}
