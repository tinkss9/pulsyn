// Trump Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quotes/random',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'message', type: 'string', nullable: false, primaryKey: true },
        { name: 'nlp_version', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['message'],
    },
    idField: 'message',
  }
];

@registerSource('trump')
export class TrumpConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trump', 'trump', config, {
      baseUrl: config.host || 'https://api.whatdoestrumpthink.com/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes/random',
    });
  }
}
