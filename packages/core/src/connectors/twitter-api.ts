// Twitter/X API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'tweets', endpoint: '/tweets/search/recent?max_results=20', schema: { name: 'tweets', table: 'tweets', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'text', type: 'string', nullable: false, primaryKey: false }, { name: 'created_at', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('twitter-api')
export class TwitterApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'twitter-api', 'twitter-api', config, {
      baseUrl: config.host || 'https://api.twitter.com/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tweets/search/recent',
    });
  }
}
