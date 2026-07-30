// @ts-nocheck
// Twitch Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'streams',
    endpoint: '/streams',
    schema: {
      name: 'streams',
      table: 'streams',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'user_name', type: 'string', nullable: true },
      { name: 'started_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('twitch')
export class TwitchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twitch', 'twitch', config, {
      baseUrl: config.host || 'https://api.twitch.tv/helix',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
