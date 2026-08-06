// CoinGecko Coins — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'coins', endpoint: '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50', schema: { name: 'coins', table: 'coins', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'symbol', type: 'string', nullable: false, primaryKey: false }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'current_price', type: 'number', nullable: false, primaryKey: false }, { name: 'market_cap', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'global', endpoint: '/global', schema: { name: 'global', table: 'global', columns: [{ name: 'active_cryptocurrencies', type: 'number', nullable: false, primaryKey: false }, { name: 'markets', type: 'number', nullable: false, primaryKey: false }, { name: 'total_market_cap', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['active_cryptocurrencies'] }, idField: 'active_cryptocurrencies' }
];

@registerSource('coingecko-coins')
export class CoingeckoCoinsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coingecko-coins', 'coingecko-coins', config, {
      baseUrl: config.host || 'https://api.coingecko.com/api/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/coins/markets',
    });
  }
}
