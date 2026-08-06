// Breaking Bad API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/characters',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'char_id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'birthday', type: 'string', nullable: false, primaryKey: false },
        { name: 'occupation', type: 'json', nullable: false, primaryKey: false },
        { name: 'status', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['char_id'],
    },
    idField: 'char_id',
  },
  {
    name: 'episodes',
    endpoint: '/episodes',
    schema: {
      name: 'episodes',
      table: 'episodes',
      columns: [
        { name: 'episode_id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'season', type: 'string', nullable: false, primaryKey: false },
        { name: 'episode', type: 'string', nullable: false, primaryKey: false },
        { name: 'air_date', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['episode_id'],
    },
    idField: 'episode_id',
  }
];

@registerSource('breakingbad')
export class BreakingbadConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'breakingbad', 'breakingbad', config, {
      baseUrl: config.host || 'https://www.breakingbadapi.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
