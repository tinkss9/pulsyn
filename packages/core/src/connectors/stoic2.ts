// Stoic Quotes v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'quotes', endpoint: '/quotes', schema: { name: 'quotes', table: 'quotes', columns: [        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'body', type: 'string', nullable: false, primaryKey: false },
        { name: 'author', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }];

@registerSource('stoic2')
export class Stoic2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'stoic2', 'stoic2', config, { baseUrl: config.host || 'https://stoicquotesapi.com/v1/api', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/quotes' });
  }
}
