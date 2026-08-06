// Hashnode Posts — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'posts', endpoint: '/getFeed?type=NEW&first=20', schema: { name: 'posts', table: 'posts', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'brief', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('hashnode-posts')
export class HashnodePostsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hashnode-posts', 'hashnode-posts', config, {
      baseUrl: config.host || 'https://hashnode.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/getFeed',
    });
  }
}
