// Kitsu Anime — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'anime',
    endpoint: '/anime?page[limit]=20',
    schema: {
      name: 'anime',
      table: 'anime',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'canonicalTitle', type: 'string', nullable: false, primaryKey: false },
        { name: 'synopsis', type: 'string', nullable: false, primaryKey: false },
        { name: 'averageRating', type: 'string', nullable: false, primaryKey: false },
        { name: 'startDate', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('kitsu')
export class KitsuConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kitsu', 'kitsu', config, {
      baseUrl: config.host || 'https://kitsu.io/api/edge',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/anime',
    });
  }
}
