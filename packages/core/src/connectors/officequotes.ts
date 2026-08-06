// Office Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quote/random',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'quote', type: 'string', nullable: false, primaryKey: true },
        { name: 'character', type: 'string', nullable: false, primaryKey: false },
        { name: 'character_avatar_url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['quote'],
    },
    idField: 'quote',
  }
];

@registerSource('officequotes')
export class OfficequotesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'officequotes', 'officequotes', config, {
      baseUrl: config.host || 'https://officeapi.akashrajpurohit.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quote/random',
    });
  }
}
