// @ts-nocheck
// Google Analytics Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'properties', endpoint: '/v1beta/properties', schema: { name: 'properties', table: 'properties', columns: [
    { name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'displayName', type: 'string', nullable: true },
    { name: 'createTime', type: 'datetime', nullable: true },
  ], primaryKey: ['name'] }, idField: 'name' },
];

@registerSource('google-analytics')
export class GoogleAnalyticsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-analytics', 'google-analytics', config, {
      baseUrl: config.host || 'https://analyticsdata.googleapis.com',
      authType: 'oauth2_refresh',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v1beta/properties',
    });
  }
}
