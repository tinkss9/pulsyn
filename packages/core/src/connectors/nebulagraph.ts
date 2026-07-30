// @ts-nocheck
// NebulaGraph Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'spaces',
    endpoint: '/spaces',
    schema: {
      name: 'spaces',
      table: 'spaces',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('nebulagraph')
export class NebulaGraphConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nebulagraph', 'nebulagraph', config, {
      baseUrl: config.host || 'http://localhost:19559',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
