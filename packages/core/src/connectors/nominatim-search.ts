// Nominatim Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'search', endpoint: '/search?q=London&format=json&limit=10', schema: { name: 'search', table: 'search', columns: [{ name: 'place_id', type: 'number', nullable: false, primaryKey: true }, { name: 'display_name', type: 'string', nullable: false, primaryKey: false }, { name: 'lat', type: 'string', nullable: false, primaryKey: false }, { name: 'lon', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['place_id'] }, idField: 'place_id' }
];

@registerSource('nominatim-search')
export class NominatimSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nominatim-search', 'nominatim-search', config, {
      baseUrl: config.host || 'https://nominatim.openstreetmap.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search',
    });
  }
}
