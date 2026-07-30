// @ts-nocheck
// Instagram Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'media',
    endpoint: '/me/media',
    schema: {
      name: 'media',
      table: 'media',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'caption', type: 'string', nullable: true },
      { name: 'media_type', type: 'string', nullable: true },
      { name: 'timestamp', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('instagram')
export class InstagramConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'instagram', 'instagram', config, {
      baseUrl: config.host || 'https://graph.instagram.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
