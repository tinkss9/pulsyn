// @ts-nocheck
// JobBOSS Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/jobs',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('jobboss')
export class JobBOSSConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jobboss', 'jobboss', config, {
      baseUrl: config.host || 'https://api.jobboss.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/jobs',
      
    });
  }
}
