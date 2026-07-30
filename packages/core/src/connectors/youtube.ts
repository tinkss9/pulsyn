// @ts-nocheck
// YouTube Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'videos',
    endpoint: '/videos?part=snippet&chart=mostPopular',
    schema: {
      name: 'videos',
      table: 'videos',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'publishedAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('youtube')
export class YouTubeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'youtube', 'youtube', config, {
      baseUrl: config.host || 'https://www.googleapis.com/youtube/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/channels?part=snippet&mine=true',
      
    });
  }
}
