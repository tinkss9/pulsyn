// Coinbase Rates — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'currencies',
    endpoint: '/currencies',
    schema: {
      name: 'currencies',
      table: 'currencies',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'min_size', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'exchange_rates',
    endpoint: '/exchange-rates?currency=BTC',
    schema: {
      name: 'exchange_rates',
      table: 'exchange_rates',
      columns: [
        { name: 'currency', type: 'string', nullable: false, primaryKey: true },
        { name: 'rate', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['currency'],
    },
    idField: 'currency',
  }
];

@registerSource('coinbase-rates')
export class CoinbaseRatesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coinbase-rates', 'coinbase-rates', config, {
      baseUrl: config.host || 'https://api.coinbase.com/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/currencies',
    });
  }
}
