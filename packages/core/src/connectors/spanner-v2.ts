// @ts-nocheck
// Cloud Spanner v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'instances',
    endpoint: '/projects/{project}/instances',
    schema: {
      name: 'instances',
      table: 'instances',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('spanner-v2')
export class CloudSpannerv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'spanner-v2', 'spanner-v2', config, {
      baseUrl: config.host || 'https://spanner.googleapis.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/projects',
      
    });
  }
}
