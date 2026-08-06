// GeoNames — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cities',
    endpoint: '/searchJSON?q=London&maxRows=50&username=demo',
    schema: {
      name: 'cities',
      table: 'cities',
      columns: [
        { name: 'geonameId', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'countryName', type: 'string', nullable: false, primaryKey: false },
        { name: 'population', type: 'number', nullable: false, primaryKey: false },
        { name: 'lat', type: 'number', nullable: false, primaryKey: false },
        { name: 'lng', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['geonameId'],
    },
    idField: 'geonameId',
  }
];

@registerSource('geonames')
export class GeonamesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'geonames', 'geonames', config, {
      baseUrl: config.host || 'http://api.geonames.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/searchJSON',
    });
  }
}
