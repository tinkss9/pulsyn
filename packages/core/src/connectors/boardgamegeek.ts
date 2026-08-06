// BoardGameGeek XML — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'hot',
    endpoint: '/hot?type=boardgame',
    schema: {
      name: 'hot',
      table: 'hot',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'yearpublished', type: 'string', nullable: false, primaryKey: false },
        { name: 'rank', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('boardgamegeek')
export class BoardgamegeekConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'boardgamegeek', 'boardgamegeek', config, {
      baseUrl: config.host || 'https://boardgamegeek.com/xmlapi2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/hot',
    });
  }
}
