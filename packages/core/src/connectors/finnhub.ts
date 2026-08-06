// Finnhub — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'stock',
    endpoint: '/quote?symbol=AAPL&token=demo',
    schema: {
      name: 'stock',
      table: 'stock',
      columns: [
        { name: 'c', type: 'number', nullable: false, primaryKey: false },
        { name: 'h', type: 'number', nullable: false, primaryKey: false },
        { name: 'l', type: 'number', nullable: false, primaryKey: false },
        { name: 'o', type: 'number', nullable: false, primaryKey: false },
        { name: 't', type: 'number', nullable: false, primaryKey: true }
      ],
      primaryKey: ['t'],
    },
    idField: 't',
  }
];

@registerSource('finnhub')
export class FinnhubConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'finnhub', 'finnhub', config, {
      baseUrl: config.host || 'https://finnhub.io/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quote',
    });
  }
}
