// RestCountries All — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'all', endpoint: '/all?fields=name,cca2,cca3,capital,region,subregion,population,area,flags', schema: { name: 'all', table: 'all', columns: [{ name: 'cca2', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'json', nullable: false, primaryKey: false }, { name: 'capital', type: 'json', nullable: false, primaryKey: false }, { name: 'region', type: 'string', nullable: false, primaryKey: false }, { name: 'population', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['cca2'] }, idField: 'cca2' }
];

@registerSource('restcountries-all')
export class RestcountriesAllConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'restcountries-all', 'restcountries-all', config, {
      baseUrl: config.host || 'https://restcountries.com/v3.1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/all',
    });
  }
}
