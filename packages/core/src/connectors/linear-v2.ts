// @ts-nocheck
// Linear v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'issues',
    endpoint: '/graphql',
    schema: {
      name: 'issues',
      table: 'issues',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      { name: 'updatedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updatedAt',
  },
];

@registerSource('linear-v2')
export class Linearv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'linear-v2', 'linear-v2', config, {
      baseUrl: config.host || 'https://api.linear.app/graphql',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/graphql',
      
    });
  }
}
