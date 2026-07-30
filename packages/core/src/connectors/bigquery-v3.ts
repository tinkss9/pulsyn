// @ts-nocheck
// BigQuery v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'datasets',
    endpoint: '/projects/{projectId}/datasets',
    schema: {
      name: 'datasets',
      table: 'datasets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'friendlyName', type: 'string', nullable: true },
      { name: 'creationTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bigquery-v3')
export class BigQueryv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bigquery-v3', 'bigquery-v3', config, {
      baseUrl: config.host || 'https://bigquery.googleapis.com/bigquery/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
