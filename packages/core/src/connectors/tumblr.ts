// Tumblr API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'blog',
    endpoint: '/blog/staff.tumblr.com/info',
    schema: {
      name: 'blog',
      table: 'blog',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'posts', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('tumblr')
export class TumblrConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tumblr', 'tumblr', config, {
      baseUrl: config.host || 'https://api.tumblr.com/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/blog/staff.tumblr.com/info',
    });
  }
}
