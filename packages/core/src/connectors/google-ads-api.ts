// Google Ads API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'campaigns', endpoint: '/customers/{id}/campaigns?pageSize=20', schema: { name: 'campaigns', table: 'campaigns', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('google-ads-api')
export class GoogleAdsApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'google-ads-api', 'google-ads-api', config, {
      baseUrl: config.host || 'https://googleads.googleapis.com/v15',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/customers/{id}/campaigns',
    });
  }
}
