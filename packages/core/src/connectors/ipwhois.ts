// IP Whois — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ip', endpoint: '/', schema: { name: 'ip', table: 'ip', columns: [        { name: 'ip', type: 'string', nullable: false, primaryKey: true },
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'country', type: 'string', nullable: false, primaryKey: false },
        { name: 'org', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['ip'] }, idField: 'ip' }];

@registerSource('ipwhois')
export class IpwhoisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ipwhois', 'ipwhois', config, { baseUrl: config.host || 'https://ipwho.is', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/' });
  }
}
