// GitHub Zen — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'zen',
    endpoint: '/zen',
    schema: {
      name: 'zen',
      table: 'zen',
      columns: [
        { name: 'quote', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['quote'],
    },
    idField: 'quote',
  },
  {
    name: 'emojis',
    endpoint: '/emojis',
    schema: {
      name: 'emojis',
      table: 'emojis',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('githubzen')
export class GithubzenConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'githubzen', 'githubzen', config, {
      baseUrl: config.host || 'https://api.github.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/zen',
    });
  }
}
