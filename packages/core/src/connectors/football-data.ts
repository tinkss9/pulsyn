// Football Data — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'competitions',
    endpoint: '/competitions',
    schema: {
      name: 'competitions',
      table: 'competitions',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'code', type: 'string', nullable: false, primaryKey: false },
        { name: 'area', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('football-data')
export class FootballDataConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'football-data', 'football-data', config, {
      baseUrl: config.host || 'https://api.football-data.org/v4',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/competitions',
    });
  }
}
