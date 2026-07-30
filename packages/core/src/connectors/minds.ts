// @ts-nocheck
// Minds Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/newsfeed',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'guid', type: 'string', nullable: false, primaryKey: true },
      { name: 'message', type: 'string', nullable: true },
      { name: 'created_timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['guid'],
    },
    idField: 'guid',
    
  },
];

@registerSource('minds')
export class MindsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'minds', 'minds', config, {
      baseUrl: config.host || 'https://www.minds.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/channel',
      
    });
  }
}
