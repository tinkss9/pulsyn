// @ts-nocheck
// Amazon Ads Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/v2/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'campaignId', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'creationDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['campaignId'],
    },
    idField: 'campaignId',
    
  },
];

@registerSource('amazon-ads')
export class AmazonAdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'amazon-ads', 'amazon-ads', config, {
      baseUrl: config.host || 'https://advertising-api.amazon.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v2/profiles',
      
    });
  }
}
