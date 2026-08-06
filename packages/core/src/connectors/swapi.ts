// Star Wars API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'people',
    endpoint: '/people',
    schema: {
      name: 'people',
      table: 'people',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'height', type: 'string', nullable: false, primaryKey: false },
        { name: 'mass', type: 'string', nullable: false, primaryKey: false },
        { name: 'hair_color', type: 'string', nullable: false, primaryKey: false },
        { name: 'skin_color', type: 'string', nullable: false, primaryKey: false },
        { name: 'birth_year', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  },
  {
    name: 'planets',
    endpoint: '/planets',
    schema: {
      name: 'planets',
      table: 'planets',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'climate', type: 'string', nullable: false, primaryKey: false },
        { name: 'terrain', type: 'string', nullable: false, primaryKey: false },
        { name: 'population', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  },
  {
    name: 'starships',
    endpoint: '/starships',
    schema: {
      name: 'starships',
      table: 'starships',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'model', type: 'string', nullable: false, primaryKey: false },
        { name: 'manufacturer', type: 'string', nullable: false, primaryKey: false },
        { name: 'cost_in_credits', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('swapi')
export class SwapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'swapi', 'swapi', config, {
      baseUrl: config.host || 'https://swapi.dev/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/people',
    });
  }
}
