// @ts-nocheck
// Databricks v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/jobs/list',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'job_id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['job_id'],
    },
    idField: 'job_id',
    
  },
];

@registerSource('databricks-v3')
export class Databricksv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'databricks-v3', 'databricks-v3', config, {
      baseUrl: config.host || 'https://your-workspace.cloud.databricks.com/api/2.1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clusters/list',
      
    });
  }
}
