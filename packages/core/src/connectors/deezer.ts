// Deezer API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'chart',
    endpoint: '/chart',
    schema: {
      name: 'chart',
      table: 'chart',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'artist', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'genres',
    endpoint: '/genre',
    schema: {
      name: 'genres',
      table: 'genres',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('deezer')
export class DeezerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deezer', 'deezer', config, {
      baseUrl: config.host || 'https://api.deezer.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/chart',
    });
  }
}
