// Quotable Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'random', endpoint: '/quotes/random?limit=10', schema: { name: 'random', table: 'random', columns: [{ name: '_id', type: 'string', nullable: false, primaryKey: true }, { name: 'content', type: 'string', nullable: false, primaryKey: false }, { name: 'author', type: 'string', nullable: false, primaryKey: false }, { name: 'tags', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['_id'] }, idField: '_id' }
];

@registerSource('quotable-random')
export class QuotableRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'quotable-random', 'quotable-random', config, {
      baseUrl: config.host || 'https://api.quotable.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes/random',
    });
  }
}
