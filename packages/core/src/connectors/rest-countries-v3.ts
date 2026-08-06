// RestCountries v3 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'all', endpoint: '/all', schema: { name: 'all', table: 'all', columns: [{ name: 'cca2', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'json', nullable: false, primaryKey: false }, { name: 'capital', type: 'json', nullable: false, primaryKey: false }, { name: 'region', type: 'string', nullable: false, primaryKey: false }, { name: 'population', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['cca2'] }, idField: 'cca2' },
{ name: 'fields', endpoint: '/all?fields=name,capital,population,area,region,subregion,languages,currencies', schema: { name: 'fields', table: 'fields', columns: [{ name: 'name', type: 'json', nullable: false, primaryKey: true }, { name: 'capital', type: 'json', nullable: false, primaryKey: false }, { name: 'population', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('rest-countries-v3')
export class RestCountriesV3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rest-countries-v3', 'rest-countries-v3', config, {
      baseUrl: config.host || 'https://restcountries.com/v3.1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/all',
    });
  }
}
