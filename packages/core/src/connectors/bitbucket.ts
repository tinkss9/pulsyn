// @ts-nocheck
// Bitbucket Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'repositories',
    endpoint: '/repositories/{workspace}',
    schema: {
      name: 'repositories',
      table: 'repositories',
      columns: [
      { name: 'uuid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'language', type: 'string', nullable: true },
      { name: 'created_on', type: 'datetime', nullable: true },
      { name: 'updated_on', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uuid'],
    },
    idField: 'uuid',
    modifiedField: 'updated_on',
  },
];

@registerSource('bitbucket')
export class BitbucketConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bitbucket', 'bitbucket', config, {
      baseUrl: config.host || 'https://api.bitbucket.org/2.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
