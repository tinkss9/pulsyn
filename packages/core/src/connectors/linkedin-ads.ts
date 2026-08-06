// LinkedIn Ads — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'campaigns', endpoint: '/adCampaignsV2?q=search&start=0&count=20', schema: { name: 'campaigns', table: 'campaigns', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('linkedin-ads')
export class LinkedinAdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'linkedin-ads', 'linkedin-ads', config, {
      baseUrl: config.host || 'https://api.linkedin.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/adCampaignsV2',
    });
  }
}
