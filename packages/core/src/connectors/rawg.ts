// RAWG Video Games — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'games',
    endpoint: '/games?key=demo&page_size=20',
    schema: {
      name: 'games',
      table: 'games',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'released', type: 'string', nullable: false, primaryKey: false },
        { name: 'rating', type: 'number', nullable: false, primaryKey: false },
        { name: 'platforms', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'genres',
    endpoint: '/genres?key=demo',
    schema: {
      name: 'genres',
      table: 'genres',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'games_count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('rawg')
export class RawgConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rawg', 'rawg', config, {
      baseUrl: config.host || 'https://api.rawg.io/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/games',
    });
  }
}
