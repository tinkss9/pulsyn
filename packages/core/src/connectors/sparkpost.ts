// @ts-nocheck
// SparkPost Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transmissions',
    endpoint: '/transmissions',
    schema: {
      name: 'transmissions',
      table: 'transmissions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('sparkpost')
export class SparkPostConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sparkpost', 'sparkpost', config, {
      baseUrl: config.host || 'https://api.sparkpost.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/transmissions',
      
    });
  }
}
