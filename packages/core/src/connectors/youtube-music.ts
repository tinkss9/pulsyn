// @ts-nocheck
// YouTube Music Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'playlists',
    endpoint: '/browse',
    schema: {
      name: 'playlists',
      table: 'playlists',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('youtube-music')
export class YouTubeMusicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'youtube-music', 'youtube-music', config, {
      baseUrl: config.host || 'https://music.youtube.com/youtubei/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/browse',
      
    });
  }
}
