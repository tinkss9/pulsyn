// Polygon.io — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickers',
    endpoint: '/v3/reference/tickers?market=stocks&limit=20&apiKey=demo',
    schema: {
      name: 'tickers',
      table: 'tickers',
      columns: [
        { name: 'ticker', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'market', type: 'string', nullable: false, primaryKey: false },
        { name: 'locale', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['ticker'],
    },
    idField: 'ticker',
  }
];

@registerSource('polygon')
export class PolygonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'polygon', 'polygon', config, {
      baseUrl: config.host || 'https://api.polygon.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v3/reference/tickers',
    });
  }
}
