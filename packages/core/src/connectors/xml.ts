// XML Page — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'xml', endpoint: '/xml', schema: { name: 'xml', table: 'xml', columns: [        { name: 'xml', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['xml'] }, idField: 'xml' }];

@registerSource('xml')
export class XmlConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'xml', 'xml', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/xml' });
  }
}
