// @ts-nocheck
// Twitter/X Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tweets',
    endpoint: '/tweets/search/recent',
    schema: {
      name: 'tweets',
      table: 'tweets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('twitter')
export class TwitterXConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twitter', 'twitter', config, {
      baseUrl: config.host || 'https://api.twitter.com/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/me',
      
    });
  }
}
