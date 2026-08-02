// Exchange Rates API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'rates',
    endpoint: '/latest',
    schema: {
      name: 'rates',
      table: 'rates',
      columns: [
        { name: 'base', type: 'string', nullable: false, primaryKey: false },
        { name: 'date', type: 'string', nullable: false, primaryKey: false },
        { name: 'rates_USD', type: 'number', nullable: true, primaryKey: false },
        { name: 'rates_EUR', type: 'number', nullable: true, primaryKey: false },
        { name: 'rates_GBP', type: 'number', nullable: true, primaryKey: false },
        { name: 'rates_JPY', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['base'],
    },
    idField: 'base',
  },
];

@registerSource('exchangerate')
export class ExchangeRateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'exchangerate', 'exchangerate', config, {
      baseUrl: config.host || 'https://open.er-api.com/v6',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/latest/USD',
    });
  }
}
