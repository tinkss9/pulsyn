// @ts-nocheck
// Bing Ads Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'campaigns',
    endpoint: '/campaigns',
    schema: {
      name: 'campaigns',
      table: 'campaigns',
      columns: [
      { name: 'Id', type: 'number', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: false },
      { name: 'Status', type: 'string', nullable: true },
      ],
      primaryKey: ['Id'],
    },
    idField: 'Id',
    
  },
];

@registerSource('bing-ads')
export class BingAdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bing-ads', 'bing-ads', config, {
      baseUrl: config.host || 'https://campaign.api.bingads.microsoft.com/v13',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/campaigns',
      
    });
  }
}
