// Reddit Rising — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'rising', endpoint: '/r/all/rising.json?limit=25', schema: { name: 'rising', table: 'rising', columns: [{ name: 'data.id', type: 'string', nullable: false, primaryKey: true }, { name: 'data.title', type: 'string', nullable: false, primaryKey: false }, { name: 'data.score', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['data.id'] }, idField: 'data.id' }
];

@registerSource('reddit-rising')
export class RedditRisingConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reddit-rising', 'reddit-rising', config, {
      baseUrl: config.host || 'https://www.reddit.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/r/all/rising.json',
    });
  }
}
