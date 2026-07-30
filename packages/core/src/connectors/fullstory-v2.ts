// @ts-nocheck
// FullStory v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'uid', type: 'string', nullable: false, primaryKey: true },
      { name: 'display_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uid'],
    },
    idField: 'uid',
    
  },
];

@registerSource('fullstory-v2')
export class FullStoryv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fullstory-v2', 'fullstory-v2', config, {
      baseUrl: config.host || 'https://api.fullstory.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
