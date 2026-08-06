// Lobsters Newest — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'stories', endpoint: '/newest.json', schema: { name: 'stories', table: 'stories', columns: [{ name: 'short_id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'score', type: 'number', nullable: false, primaryKey: false }, { name: 'tags', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['short_id'] }, idField: 'short_id' }
];

@registerSource('lobsters-newest')
export class LobstersNewestConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lobsters-newest', 'lobsters-newest', config, {
      baseUrl: config.host || 'https://lobste.rs',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/newest.json',
    });
  }
}
