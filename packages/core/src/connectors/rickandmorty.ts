// Rick and Morty API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/character',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'status', type: 'string', nullable: false, primaryKey: false },
        { name: 'species', type: 'string', nullable: false, primaryKey: false },
        { name: 'gender', type: 'string', nullable: false, primaryKey: false },
        { name: 'origin', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'locations',
    endpoint: '/location',
    schema: {
      name: 'locations',
      table: 'locations',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'dimension', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'episodes',
    endpoint: '/episode',
    schema: {
      name: 'episodes',
      table: 'episodes',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'air_date', type: 'string', nullable: false, primaryKey: false },
        { name: 'episode', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('rickandmorty')
export class RickandmortyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rickandmorty', 'rickandmorty', config, {
      baseUrl: config.host || 'https://rickandmortyapi.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/character',
    });
  }
}
