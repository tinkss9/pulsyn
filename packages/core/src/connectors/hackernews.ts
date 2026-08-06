// Hacker News — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'top',
    endpoint: '/topstories.json',
    schema: {
      name: 'top',
      table: 'top',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'item',
    endpoint: '/item/8863.json',
    schema: {
      name: 'item',
      table: 'item',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'by', type: 'string', nullable: false, primaryKey: false },
        { name: 'score', type: 'number', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('hackernews')
export class HackernewsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hackernews', 'hackernews', config, {
      baseUrl: config.host || 'https://hacker-news.firebaseio.com/v0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/topstories.json',
    });
  }
}
