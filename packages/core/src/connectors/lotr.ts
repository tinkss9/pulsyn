// Lord of the Rings API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'movie',
    endpoint: '/movie',
    schema: {
      name: 'movie',
      table: 'movie',
      columns: [
        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'runtimeInMinutes', type: 'number', nullable: false, primaryKey: false },
        { name: 'budgetInMillions', type: 'number', nullable: false, primaryKey: false },
        { name: 'rottenTomatoesScore', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  }
];

@registerSource('lotr')
export class LotrConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lotr', 'lotr', config, {
      baseUrl: config.host || 'https://the-one-api.dev/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/movie',
    });
  }
}
