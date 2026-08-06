// World Bank API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'countries',
    endpoint: '/country?format=json&per_page=50',
    schema: {
      name: 'countries',
      table: 'countries',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'capitalCity', type: 'string', nullable: false, primaryKey: false },
        { name: 'longitude', type: 'string', nullable: false, primaryKey: false },
        { name: 'latitude', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'indicators',
    endpoint: '/indicator?format=json&per_page=50',
    schema: {
      name: 'indicators',
      table: 'indicators',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'source', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('worldbank')
export class WorldbankConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'worldbank', 'worldbank', config, {
      baseUrl: config.host || 'https://api.worldbank.org/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/country',
    });
  }
}
