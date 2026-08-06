// Trump Says — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'random', endpoint: '/random/quote', schema: { name: 'random', table: 'random', columns: [        { name: 'quote_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'value', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['quote_id'] }, idField: 'quote_id' }];

@registerSource('trump2')
export class Trump2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trump2', 'trump2', config, { baseUrl: config.host || 'https://tronalddump.io', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/random/quote' });
  }
}
