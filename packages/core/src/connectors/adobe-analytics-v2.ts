// @ts-nocheck
// Adobe Analytics v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'reports',
    endpoint: '/reports',
    schema: {
      name: 'reports',
      table: 'reports',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('adobe-analytics-v2')
export class AdobeAnalyticsv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adobe-analytics-v2', 'adobe-analytics-v2', config, {
      baseUrl: config.host || 'https://analytics.adobe.io/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/organizations',
      
    });
  }
}
