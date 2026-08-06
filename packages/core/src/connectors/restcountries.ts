// RestCountries — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'countries',
    endpoint: '/all',
    schema: {
      name: 'countries',
      table: 'countries',
      columns: [
        { name: 'name', type: 'json', nullable: false, primaryKey: false },
        { name: 'cca2', type: 'string', nullable: false, primaryKey: true },
        { name: 'cca3', type: 'string', nullable: false, primaryKey: false },
        { name: 'capital', type: 'json', nullable: false, primaryKey: false },
        { name: 'region', type: 'string', nullable: false, primaryKey: false },
        { name: 'subregion', type: 'string', nullable: false, primaryKey: false },
        { name: 'population', type: 'number', nullable: false, primaryKey: false },
        { name: 'area', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['cca2'],
    },
    idField: 'cca2',
  }
];

@registerSource('restcountries')
export class RestcountriesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'restcountries', 'restcountries', config, {
      baseUrl: config.host || 'https://restcountries.com/v3.1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/all',
    });
  }
}
