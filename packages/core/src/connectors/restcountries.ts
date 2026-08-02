// REST Countries Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'countries',
    endpoint: '/v3.1/all',
    schema: {
      name: 'countries',
      table: 'countries',
      columns: [
        { name: 'cca3', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'json', nullable: false, primaryKey: false },
        { name: 'capital', type: 'json', nullable: true, primaryKey: false },
        { name: 'region', type: 'string', nullable: true, primaryKey: false },
        { name: 'subregion', type: 'string', nullable: true, primaryKey: false },
        { name: 'population', type: 'number', nullable: true, primaryKey: false },
        { name: 'area', type: 'number', nullable: true, primaryKey: false },
        { name: 'languages', type: 'json', nullable: true, primaryKey: false },
        { name: 'currencies', type: 'json', nullable: true, primaryKey: false },
        { name: 'flags', type: 'json', nullable: true, primaryKey: false },
      ],
      primaryKey: ['cca3'],
    },
    idField: 'cca3',
  },
];

@registerSource('restcountries')
export class RestCountriesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'restcountries', 'restcountries', config, {
      baseUrl: config.host || 'https://restcountries.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v3.1/name/germany',
    });
  }
}
