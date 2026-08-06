// DEV.to Articles — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'articles', endpoint: '/articles?per_page=20', schema: { name: 'articles', table: 'articles', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'description', type: 'string', nullable: false, primaryKey: false }, { name: 'published_at', type: 'string', nullable: false, primaryKey: false }, { name: 'tag_list', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('devto-articles')
export class DevtoArticlesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'devto-articles', 'devto-articles', config, {
      baseUrl: config.host || 'https://dev.to/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/articles',
    });
  }
}
