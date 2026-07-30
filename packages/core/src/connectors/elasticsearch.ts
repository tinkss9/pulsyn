// @ts-nocheck
// Elasticsearch Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'indices',
    endpoint: '/_cat/indices',
    schema: {
      name: 'indices',
      table: 'indices',
      columns: [
      { name: 'index', type: 'string', nullable: false, primaryKey: true },
      { name: 'health', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'docs.count', type: 'number', nullable: true },
      ],
      primaryKey: ['index'],
    },
    idField: 'index',
    
  },
];

@registerSource('elasticsearch')
export class ElasticsearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'elasticsearch', 'elasticsearch', config, {
      baseUrl: config.host || 'http://localhost:9200',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/_cluster/health',
      
    });
  }
}
