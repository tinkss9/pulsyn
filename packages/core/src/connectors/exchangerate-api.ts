// ExchangeRate API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'rates',
    endpoint: '/latest/USD',
    schema: {
      name: 'rates',
      table: 'rates',
      columns: [
        { name: 'base_code', type: 'string', nullable: false, primaryKey: true },
        { name: 'time_last_update_utc', type: 'string', nullable: false, primaryKey: false },
        { name: 'rates', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['base_code'],
    },
    idField: 'base_code',
  }
];

@registerSource('exchangerate-api')
export class ExchangerateApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exchangerate-api', 'exchangerate-api', config, {
      baseUrl: config.host || 'https://open.er-api.com/v6',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/latest/USD',
    });
  }
}
