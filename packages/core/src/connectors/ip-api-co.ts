// ip-api.co — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'ip', endpoint: '/8.8.8.8/json/', schema: { name: 'ip', table: 'ip', columns: [        { name: 'ip', type: 'string', nullable: false, primaryKey: true },
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'country_name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['ip'] }, idField: 'ip' }];

@registerSource('ip-api-co')
export class IpApiCoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ip-api-co', 'ip-api-co', config, { baseUrl: config.host || 'https://ipapi.co', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/8.8.8.8/json/' });
  }
}
