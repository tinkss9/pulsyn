// @ts-nocheck
// Vimeo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'videos',
    endpoint: '/me/videos',
    schema: {
      name: 'videos',
      table: 'videos',
      columns: [
      { name: 'uri', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['uri'],
    },
    idField: 'uri',
    
  },
];

@registerSource('vimeo')
export class VimeoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vimeo', 'vimeo', config, {
      baseUrl: config.host || 'https://api.vimeo.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
