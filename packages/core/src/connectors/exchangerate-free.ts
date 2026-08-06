// ExchangeRate Free — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'latest', endpoint: '/latest/USD', schema: { name: 'latest', table: 'latest', columns: [{ name: 'base_code', type: 'string', nullable: false, primaryKey: true }, { name: 'time_last_update_utc', type: 'string', nullable: false, primaryKey: false }, { name: 'rates', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['base_code'] }, idField: 'base_code' }
];

@registerSource('exchangerate-free')
export class ExchangerateFreeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exchangerate-free', 'exchangerate-free', config, {
      baseUrl: config.host || 'https://open.er-api.com/v6',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/latest/USD',
    });
  }
}
