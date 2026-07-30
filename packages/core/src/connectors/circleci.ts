// @ts-nocheck
// CircleCI Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pipelines',
    endpoint: '/pipeline',
    schema: {
      name: 'pipelines',
      table: 'pipelines',
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

@registerSource('circleci')
export class CircleCIConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'circleci', 'circleci', config, {
      baseUrl: config.host || 'https://circleci.com/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
