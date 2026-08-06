// Geocode Farm — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'geocode', endpoint: '/json/?addr=London&country=GB', schema: { name: 'geocode', table: 'geocode', columns: [{ name: 'address', type: 'string', nullable: false, primaryKey: true }, { name: 'lat', type: 'string', nullable: false, primaryKey: false }, { name: 'lng', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['address'] }, idField: 'address' }
];

@registerSource('geocode-farm')
export class GeocodeFarmConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'geocode-farm', 'geocode-farm', config, {
      baseUrl: config.host || 'https://www.geocode.farm/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/json/',
    });
  }
}
