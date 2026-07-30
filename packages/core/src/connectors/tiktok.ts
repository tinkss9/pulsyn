// @ts-nocheck
// TikTok Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'videos',
    endpoint: '/video/list/',
    schema: {
      name: 'videos',
      table: 'videos',
      columns: [
      { name: 'video_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'create_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['video_id'],
    },
    idField: 'video_id',
    
  },
];

@registerSource('tiktok')
export class TikTokConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tiktok', 'tiktok', config, {
      baseUrl: config.host || 'https://business-api.tiktok.com/open_api/v1.3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user/info/',
      
    });
  }
}
