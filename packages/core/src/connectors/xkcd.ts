// XKCD Comics — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'comics',
    endpoint: '/info.0.json',
    schema: {
      name: 'comics',
      table: 'comics',
      columns: [
        { name: 'num', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'alt', type: 'string', nullable: false, primaryKey: false },
        { name: 'img', type: 'string', nullable: false, primaryKey: false },
        { name: 'year', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['num'],
    },
    idField: 'num',
  }
];

@registerSource('xkcd')
export class XkcdConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'xkcd', 'xkcd', config, {
      baseUrl: config.host || 'https://xkcd.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/info.0.json',
    });
  }
}
