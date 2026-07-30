// @ts-nocheck
// Axure Cloud Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'projects',
    endpoint: '/projects',
    schema: {
      name: 'projects',
      table: 'projects',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('axure')
export class AxureCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'axure', 'axure', config, {
      baseUrl: config.host || 'https://cloud.axure.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/projects',
      
    });
  }
}
