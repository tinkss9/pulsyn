// Coin Flip — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'flip',
    endpoint: '/flip',
    schema: {
      name: 'flip',
      table: 'flip',
      columns: [
        { name: 'result', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['result'],
    },
    idField: 'result',
  }
];

@registerSource('coin-flip')
export class CoinFlipConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coin-flip', 'coin-flip', config, {
      baseUrl: config.host || 'https://coinflip-api.vercel.app',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/flip',
    });
  }
}
