// @ts-nocheck
// Mode Analytics Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reports',
    endpoint: '/{workspace}/reports',
    schema: {
      name: 'reports',
      table: 'reports',
      columns: [
      { name: 'token', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['token'],
    },
    idField: 'token',
    
  },
];

@registerSource('mode')
export class ModeAnalyticsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mode', 'mode', config, {
      baseUrl: config.host || 'https://app.mode.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/account',
      
    });
  }
}
