// CoinDesk — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'bpi',
    endpoint: '/bpi/currentprice.json',
    schema: {
      name: 'bpi',
      table: 'bpi',
      columns: [
        { name: 'code', type: 'string', nullable: false, primaryKey: true },
        { name: 'rate', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['code'],
    },
    idField: 'code',
  }
];

@registerSource('coindesk')
export class CoindeskConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coindesk', 'coindesk', config, {
      baseUrl: config.host || 'https://api.coindesk.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/bpi/currentprice.json',
    });
  }
}
