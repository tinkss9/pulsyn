// Library of Congress — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'books',
    endpoint: '/books/?q=democracy&fo=json&c=20',
    schema: {
      name: 'books',
      table: 'books',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'creator', type: 'string', nullable: false, primaryKey: false },
        { name: 'date', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('loc')
export class LocConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'loc', 'loc', config, {
      baseUrl: config.host || 'https://www.loc.gov',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/books/',
    });
  }
}
