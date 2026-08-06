// Corporate Ipsum — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'text', endpoint: '/api/?paras=1', schema: { name: 'text', table: 'text', columns: [        { name: 'text', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['text'] }, idField: 'text' }];

@registerSource('corporate-ipsum')
export class CorporateIpsumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'corporate-ipsum', 'corporate-ipsum', config, { baseUrl: config.host || 'https://corporateipsum.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/' });
  }
}
