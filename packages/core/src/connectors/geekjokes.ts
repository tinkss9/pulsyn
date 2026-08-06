// Geek Jokes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jokes',
    endpoint: '/api?format=json',
    schema: {
      name: 'jokes',
      table: 'jokes',
      columns: [
        { name: 'joke', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['joke'],
    },
    idField: 'joke',
  }
];

@registerSource('geekjokes')
export class GeekjokesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'geekjokes', 'geekjokes', config, {
      baseUrl: config.host || 'https://geek-jokes.sameerkumar.website',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api',
    });
  }
}
