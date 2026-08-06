// IP Echo — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ip', endpoint: '?format=json', schema: { name: 'ip', table: 'ip', columns: [        { name: 'ip', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['ip'] }, idField: 'ip' }];

@registerSource('ip-echo')
export class IpEchoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ip-echo', 'ip-echo', config, { baseUrl: config.host || 'https://api.ipify.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '' });
  }
}
