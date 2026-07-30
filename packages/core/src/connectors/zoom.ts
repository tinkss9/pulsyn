// @ts-nocheck
// Zoom Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'meetings',
    endpoint: '/users/me/meetings',
    schema: {
      name: 'meetings',
      table: 'meetings',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'topic', type: 'string', nullable: false },
      { name: 'type', type: 'number', nullable: true },
      { name: 'start_time', type: 'datetime', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
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

@registerSource('zoom')
export class ZoomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zoom', 'zoom', config, {
      baseUrl: config.host || 'https://api.zoom.us/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'nextPageToken',
      healthEndpoint: '/users/me',
      
    });
  }
}
