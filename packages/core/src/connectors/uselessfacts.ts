// Useless Facts — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'facts',
    endpoint: '/facts/random',
    schema: {
      name: 'facts',
      table: 'facts',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'text', type: 'string', nullable: false, primaryKey: false },
        { name: 'source', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('uselessfacts')
export class UselessfactsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'uselessfacts', 'uselessfacts', config, {
      baseUrl: config.host || 'https://uselessfacts.jsph.pl/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/facts/random',
    });
  }
}
