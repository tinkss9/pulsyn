// Countries Now — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'countries',
    endpoint: '/countries/info?returns=name,capital,currency,flag',
    schema: {
      name: 'countries',
      table: 'countries',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'capital', type: 'string', nullable: false, primaryKey: false },
        { name: 'currency', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  },
  {
    name: 'population',
    endpoint: '/countries/population',
    schema: {
      name: 'population',
      table: 'population',
      columns: [
        { name: 'country', type: 'string', nullable: false, primaryKey: true },
        { name: 'population_counts', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['country'],
    },
    idField: 'country',
  }
];

@registerSource('countries-now')
export class CountriesNowConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'countries-now', 'countries-now', config, {
      baseUrl: config.host || 'https://countriesnow.space/api/v0.1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/countries/info',
    });
  }
}
