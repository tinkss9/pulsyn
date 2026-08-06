// Alpha Vantage — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'exchange_rate',
    endpoint: '?function=CURRENCY_EXCHANGE_RATE&from_currency=BTC&to_currency=USD&apikey=demo',
    schema: {
      name: 'exchange_rate',
      table: 'exchange_rate',
      columns: [
        { name: 'From_Currency_Code', type: 'string', nullable: false, primaryKey: true },
        { name: 'To_Currency_Code', type: 'string', nullable: false, primaryKey: false },
        { name: 'Exchange_Rate', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['From_Currency_Code'],
    },
    idField: 'From_Currency_Code',
  }
];

@registerSource('alpha-vantage')
export class AlphaVantageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'alpha-vantage', 'alpha-vantage', config, {
      baseUrl: config.host || 'https://www.alphavantage.co/query',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
