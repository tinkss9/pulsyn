// Range Request — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'range', endpoint: '/range/32', schema: { name: 'range', table: 'range', columns: [        { name: 'data', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['data'] }, idField: 'data' }];

@registerSource('range')
export class RangeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'range', 'range', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/range/32' });
  }
}
