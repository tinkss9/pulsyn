// JSONServer — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/posts',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'body', type: 'string', nullable: false, primaryKey: false },
        { name: 'userId', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'comments',
    endpoint: '/comments',
    schema: {
      name: 'comments',
      table: 'comments',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'body', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'albums',
    endpoint: '/albums',
    schema: {
      name: 'albums',
      table: 'albums',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'userId', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'photos',
    endpoint: '/photos',
    schema: {
      name: 'photos',
      table: 'photos',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false },
        { name: 'thumbnailUrl', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('jsonserver')
export class JsonserverConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jsonserver', 'jsonserver', config, {
      baseUrl: config.host || 'https://jsonplaceholder.typicode.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/posts',
    });
  }
}
