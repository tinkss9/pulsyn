// Tronald Dump — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/random/quote',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'quote_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'value', type: 'string', nullable: false, primaryKey: false },
        { name: 'appeared_at', type: 'string', nullable: false, primaryKey: false },
        { name: 'tags', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['quote_id'],
    },
    idField: 'quote_id',
  }
];

@registerSource('tronalddump')
export class TronalddumpConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tronalddump', 'tronalddump', config, {
      baseUrl: config.host || 'https://api.tronalddump.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/random/quote',
    });
  }
}
