// Mastodon Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'trending',
    endpoint: '/trends?limit=20',
    schema: {
      name: 'trending',
      table: 'trending',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'url', type: 'string', nullable: false, primaryKey: false },
        { name: 'history', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('mastodon-public')
export class MastodonPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mastodon-public', 'mastodon-public', config, {
      baseUrl: config.host || 'https://mastodon.social/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/trends',
    });
  }
}
