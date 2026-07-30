// @ts-nocheck
// Apache Doris Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clusters',
    endpoint: '/clusters',
    schema: {
      name: 'clusters',
      table: 'clusters',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('doris')
export class ApacheDorisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'doris', 'doris', config, {
      baseUrl: config.host || 'https://api.doris.apache.org/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/clusters',
      
    });
  }
}
