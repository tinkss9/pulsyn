// JokeAPI Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'jokes', endpoint: '/joke/Any?amount=10', schema: { name: 'jokes', table: 'jokes', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'type', type: 'string', nullable: false, primaryKey: false }, { name: 'joke', type: 'string', nullable: false, primaryKey: false }, { name: 'setup', type: 'string', nullable: false, primaryKey: false }, { name: 'delivery', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('jokeapi-random')
export class JokeapiRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jokeapi-random', 'jokeapi-random', config, {
      baseUrl: config.host || 'https://v2.jokeapi.dev',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/joke/Any',
    });
  }
}
