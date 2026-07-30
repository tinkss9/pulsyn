// @ts-nocheck
// SoundCloud Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tracks',
    endpoint: '/me/tracks',
    schema: {
      name: 'tracks',
      table: 'tracks',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('soundcloud')
export class SoundCloudConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'soundcloud', 'soundcloud', config, {
      baseUrl: config.host || 'https://api.soundcloud.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
