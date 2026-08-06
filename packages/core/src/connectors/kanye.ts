// Kanye Rest — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'quote', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['quote'],
    },
    idField: 'quote',
  }
];

@registerSource('kanye')
export class KanyeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kanye', 'kanye', config, {
      baseUrl: config.host || 'https://api.kanye.rest',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
