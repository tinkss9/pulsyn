// @ts-nocheck
// Apple Music Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'playlists',
    endpoint: '/me/library/playlists',
    schema: {
      name: 'playlists',
      table: 'playlists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'dateAdded', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('apple-music')
export class AppleMusicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'apple-music', 'apple-music', config, {
      baseUrl: config.host || 'https://api.music.apple.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
