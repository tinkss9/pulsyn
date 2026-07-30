// @ts-nocheck
// Apple Search Ads Connector — Auto-generated from config
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
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('apple-search-ads')
export class AppleSearchAdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'apple-search-ads', 'apple-search-ads', config, {
      baseUrl: config.host || 'https://api.searchads.apple.com/api/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/campaigns',
      
    });
  }
}
