// TheSportsDB — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leagues',
    endpoint: '/all_leagues.php',
    schema: {
      name: 'leagues',
      table: 'leagues',
      columns: [
        { name: 'idLeague', type: 'string', nullable: false, primaryKey: true },
        { name: 'strLeague', type: 'string', nullable: false, primaryKey: false },
        { name: 'strSport', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['idLeague'],
    },
    idField: 'idLeague',
  },
  {
    name: 'teams',
    endpoint: '/search_all_teams.php?l=English%20Premier%20League',
    schema: {
      name: 'teams',
      table: 'teams',
      columns: [
        { name: 'idTeam', type: 'string', nullable: false, primaryKey: true },
        { name: 'strTeam', type: 'string', nullable: false, primaryKey: false },
        { name: 'strStadium', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['idTeam'],
    },
    idField: 'idTeam',
  }
];

@registerSource('sportsdb')
export class SportsdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sportsdb', 'sportsdb', config, {
      baseUrl: config.host || 'https://www.thesportsdb.com/api/v1/json/3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/all_leagues.php',
    });
  }
}
