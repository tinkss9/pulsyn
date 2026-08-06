// Ron Swanson Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'quotes', endpoint: '/quotes', schema: { name: 'quotes', table: 'quotes', columns: [{ name: 'quote', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['quote'] }, idField: 'quote' }
];

@registerSource('ron-swanson')
export class RonSwansonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ron-swanson', 'ron-swanson', config, {
      baseUrl: config.host || 'https://ron-swanson-quotes.herokuapp.com/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes',
    });
  }
}
