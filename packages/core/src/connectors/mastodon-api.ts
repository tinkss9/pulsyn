// Mastodon API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'trending', endpoint: '/trends?limit=20', schema: { name: 'trending', table: 'trending', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'url', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('mastodon-api')
export class MastodonApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mastodon-api', 'mastodon-api', config, {
      baseUrl: config.host || 'https://mastodon.social/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/trends',
    });
  }
}
