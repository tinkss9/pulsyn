// GZip Response — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'gzip', endpoint: '/gzip', schema: { name: 'gzip', table: 'gzip', columns: [        { name: 'gzipped', type: 'boolean', nullable: false, primaryKey: true }], primaryKey: ['gzipped'] }, idField: 'gzipped' }];

@registerSource('gzip')
export class GzipConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gzip', 'gzip', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/gzip' });
  }
}
