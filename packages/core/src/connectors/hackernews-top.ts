// Hacker News Top — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'top', endpoint: '/topstories.json', schema: { name: 'top', table: 'top', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'best', endpoint: '/beststories.json', schema: { name: 'best', table: 'best', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'new', endpoint: '/newstories.json', schema: { name: 'new', table: 'new', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('hackernews-top')
export class HackernewsTopConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hackernews-top', 'hackernews-top', config, {
      baseUrl: config.host || 'https://hacker-news.firebaseio.com/v0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/topstories.json',
    });
  }
}
