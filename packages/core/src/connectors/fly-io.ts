// @ts-nocheck
// Fly.io Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'apps',
    endpoint: '/graphql',
    schema: {
      name: 'apps',
      table: 'apps',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('fly-io')
export class FlyioConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fly-io', 'fly-io', config, {
      baseUrl: config.host || 'https://api.fly.io/graphql',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/graphql',
      
    });
  }
}
