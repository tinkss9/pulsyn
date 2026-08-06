// Programming Quotes v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'quotes', endpoint: '/quotes/random', schema: { name: 'quotes', table: 'quotes', columns: [        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'en', type: 'string', nullable: false, primaryKey: false },
        { name: 'author', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['_id'] }, idField: '_id' }];

@registerSource('programming-quotes2')
export class ProgrammingQuotes2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'programming-quotes2', 'programming-quotes2', config, { baseUrl: config.host || 'https://programming-quotes-api-pi.vercel.app/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/quotes/random' });
  }
}
