// ZenQuotes Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'quotes', endpoint: '/random', schema: { name: 'quotes', table: 'quotes', columns: [{ name: 'q', type: 'string', nullable: false, primaryKey: true }, { name: 'a', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['q'] }, idField: 'q' }
];

@registerSource('zenquotes-random')
export class ZenquotesRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zenquotes-random', 'zenquotes-random', config, {
      baseUrl: config.host || 'https://zenquotes.io/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/random',
    });
  }
}
