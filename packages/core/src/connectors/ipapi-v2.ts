// ipapi v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'json', endpoint: '/json', schema: { name: 'json', table: 'json', columns: [{ name: 'ip', type: 'string', nullable: false, primaryKey: true }, { name: 'city', type: 'string', nullable: false, primaryKey: false }, { name: 'region', type: 'string', nullable: false, primaryKey: false }, { name: 'country_name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['ip'] }, idField: 'ip' }
];

@registerSource('ipapi-v2')
export class IpapiV2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ipapi-v2', 'ipapi-v2', config, {
      baseUrl: config.host || 'https://ipapi.co',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/json',
    });
  }
}
