// @ts-nocheck
// Bluesky Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/app.bsky.feed.getAuthorFeed',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'uri', type: 'string', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uri'],
    },
    idField: 'uri',
    
  },
];

@registerSource('bluesky')
export class BlueskyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bluesky', 'bluesky', config, {
      baseUrl: config.host || 'https://public.api.bsky.app/xrpc',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/app.bsky.actor.getProfile',
      
    });
  }
}
