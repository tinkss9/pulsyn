// @ts-nocheck
// Zoom v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'webinars',
    endpoint: '/users/me/webinars',
    schema: {
      name: 'webinars',
      table: 'webinars',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'topic', type: 'string', nullable: false },
      { name: 'start_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zoom-v3')
export class Zoomv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zoom-v3', 'zoom-v3', config, {
      baseUrl: config.host || 'https://api.zoom.us/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'nextPageToken',
      healthEndpoint: '/users/me',
      
    });
  }
}
