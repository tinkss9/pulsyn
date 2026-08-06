// Twitter Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'trends',
    endpoint: '/trends/by/woeid/1',
    schema: {
      name: 'trends',
      table: 'trends',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'tweet_volume', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('twitter-public')
export class TwitterPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twitter-public', 'twitter-public', config, {
      baseUrl: config.host || 'https://api.twitter.com/2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/trends/by/woeid/1',
    });
  }
}
