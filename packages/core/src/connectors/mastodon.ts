// @ts-nocheck
// Mastodon Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'statuses',
    endpoint: '/statuses',
    schema: {
      name: 'statuses',
      table: 'statuses',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'content', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('mastodon')
export class MastodonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mastodon', 'mastodon', config, {
      baseUrl: config.host || 'https://mastodon.social/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/instance',
      
    });
  }
}
