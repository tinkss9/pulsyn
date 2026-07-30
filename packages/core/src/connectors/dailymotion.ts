// @ts-nocheck
// Dailymotion Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('dailymotion')
export class DailymotionConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dailymotion', 'dailymotion', config, {
      baseUrl: config.host || 'https://api.dailymotion.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
