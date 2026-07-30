// @ts-nocheck
// Google Analytics v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'properties',
    endpoint: '/properties',
    schema: {
      name: 'properties',
      table: 'properties',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: true },
      { name: 'createTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('google-analytics-v3')
export class GoogleAnalyticsv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-analytics-v3', 'google-analytics-v3', config, {
      baseUrl: config.host || 'https://analyticsdata.googleapis.com/v1beta',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/properties',
      
    });
  }
}
