// ExchangeRate Latest — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'latest', endpoint: '/latest/USD', schema: { name: 'latest', table: 'latest', columns: [{ name: 'base_code', type: 'string', nullable: false, primaryKey: true }, { name: 'rates', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['base_code'] }, idField: 'base_code' }
];

@registerSource('exchangerate-latest')
export class ExchangerateLatestConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exchangerate-latest', 'exchangerate-latest', config, {
      baseUrl: config.host || 'https://open.er-api.com/v6',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/latest/USD',
    });
  }
}
