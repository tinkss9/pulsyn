// AniList GraphQL — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'trending',
    endpoint: '',
    schema: {
      name: 'trending',
      table: 'trending',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'json', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'averageScore', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('aniapi')
export class AniapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aniapi', 'aniapi', config, {
      baseUrl: config.host || 'https://graphql.anilist.co',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
