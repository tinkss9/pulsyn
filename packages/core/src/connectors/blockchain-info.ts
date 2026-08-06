// Blockchain.info — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'ticker',
    endpoint: '/ticker',
    schema: {
      name: 'ticker',
      table: 'ticker',
      columns: [
        { name: 'symbol', type: 'string', nullable: false, primaryKey: true },
        { name: 'last', type: 'number', nullable: false, primaryKey: false },
        { name: 'buy', type: 'number', nullable: false, primaryKey: false },
        { name: 'sell', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['symbol'],
    },
    idField: 'symbol',
  }
];

@registerSource('blockchain-info')
export class BlockchainInfoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'blockchain-info', 'blockchain-info', config, {
      baseUrl: config.host || 'https://blockchain.info',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/ticker',
    });
  }
}
