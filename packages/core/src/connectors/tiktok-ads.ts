// @ts-nocheck
// TikTok Ads Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/campaign/get/',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'campaign_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'campaign_name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'create_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['campaign_id'],
    },
    idField: 'campaign_id',
    
  },
];

@registerSource('tiktok-ads')
export class TikTokAdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tiktok-ads', 'tiktok-ads', config, {
      baseUrl: config.host || 'https://business-api.tiktok.com/open_api/v1.3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user/info/',
      
    });
  }
}
