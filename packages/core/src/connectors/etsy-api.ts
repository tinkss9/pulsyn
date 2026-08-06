// Etsy API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'listings', endpoint: '/application/shops/{shop_id}/listings?limit=20', schema: { name: 'listings', table: 'listings', columns: [{ name: 'listing_id', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'price', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['listing_id'] }, idField: 'listing_id' }
];

@registerSource('etsy-api')
export class EtsyApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'etsy-api', 'etsy-api', config, {
      baseUrl: config.host || 'https://openapi.etsy.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/application/shops/{shop_id}/listings',
    });
  }
}
