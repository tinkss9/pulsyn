// IGDB/Twitch — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'games',
    endpoint: '/games',
    schema: {
      name: 'games',
      table: 'games',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'summary', type: 'string', nullable: false, primaryKey: false },
        { name: 'rating', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('igdb')
export class IgdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'igdb', 'igdb', config, {
      baseUrl: config.host || 'https://api.igdb.com/v4',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/games',
    });
  }
}
