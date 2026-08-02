// JSONPlaceholder Connector — Community API (No Auth)
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
        { name: 'userId', type: 'number', nullable: false, primaryKey: false },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'body', type: 'string', nullable: false, primaryKey: false },
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
        { name: 'postId', type: 'number', nullable: false, primaryKey: false },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'body', type: 'string', nullable: false, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'users',
    endpoint: '/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'username', type: 'string', nullable: false, primaryKey: false },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'phone', type: 'string', nullable: true, primaryKey: false },
        { name: 'website', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
];

@registerSource('jsonplaceholder')
export class JSONPlaceholderConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jsonplaceholder', 'jsonplaceholder', config, {
      baseUrl: config.host || 'https://jsonplaceholder.typicode.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/posts/1',
    });
  }
}
