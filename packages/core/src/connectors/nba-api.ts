// NBA API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'players',
    endpoint: '/players?per_page=20',
    schema: {
      name: 'players',
      table: 'players',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'first_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'last_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'position', type: 'string', nullable: false, primaryKey: false },
        { name: 'team', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'teams',
    endpoint: '/teams',
    schema: {
      name: 'teams',
      table: 'teams',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'conference', type: 'string', nullable: false, primaryKey: false },
        { name: 'division', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('nba-api')
export class NbaApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nba-api', 'nba-api', config, {
      baseUrl: config.host || 'https://www.balldontlie.io/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/players',
    });
  }
}
