// Quotable — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quotes?limit=50',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'content', type: 'string', nullable: false, primaryKey: false },
        { name: 'author', type: 'string', nullable: false, primaryKey: false },
        { name: 'tags', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  },
  {
    name: 'authors',
    endpoint: '/authors?limit=50',
    schema: {
      name: 'authors',
      table: 'authors',
      columns: [
        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'bio', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  }
];

@registerSource('quotable')
export class QuotableConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'quotable', 'quotable', config, {
      baseUrl: config.host || 'https://api.quotable.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes',
    });
  }
}
