// IP Geolocation — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'geo', endpoint: '/json', schema: { name: 'geo', table: 'geo', columns: [        { name: 'ip', type: 'string', nullable: false, primaryKey: true },
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'region', type: 'string', nullable: false, primaryKey: false },
        { name: 'country_name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['ip'] }, idField: 'ip' }];

@registerSource('ip-geolocation')
export class IpGeolocationConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ip-geolocation', 'ip-geolocation', config, { baseUrl: config.host || 'https://ipapi.co', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/json' });
  }
}
