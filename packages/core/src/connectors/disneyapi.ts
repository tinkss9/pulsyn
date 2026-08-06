// Disney API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/character?pageSize=50',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: '_id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'films', type: 'json', nullable: false, primaryKey: false },
        { name: 'tvShows', type: 'json', nullable: false, primaryKey: false },
        { name: 'videoGames', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  }
];

@registerSource('disneyapi')
export class DisneyapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'disneyapi', 'disneyapi', config, {
      baseUrl: config.host || 'https://api.disneyapi.dev',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/character',
    });
  }
}
