// Lobsters — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'hottest', endpoint: '/hottest.json', schema: { name: 'hottest', table: 'hottest', columns: [{ name: 'short_id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'score', type: 'number', nullable: false, primaryKey: false }, { name: 'url', type: 'string', nullable: false, primaryKey: false }, { name: 'tags', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['short_id'] }, idField: 'short_id' },
{ name: 'newest', endpoint: '/newest.json', schema: { name: 'newest', table: 'newest', columns: [{ name: 'short_id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'score', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['short_id'] }, idField: 'short_id' }
];

@registerSource('lobsters')
export class LobstersConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lobsters', 'lobsters', config, {
      baseUrl: config.host || 'https://lobste.rs',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/hottest.json',
    });
  }
}
