// DummyJSON — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/products?limit=50',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'price', type: 'number', nullable: false, primaryKey: false },
        { name: 'category', type: 'string', nullable: false, primaryKey: false },
        { name: 'brand', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'users',
    endpoint: '/users?limit=50',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'firstName', type: 'string', nullable: false, primaryKey: false },
        { name: 'lastName', type: 'string', nullable: false, primaryKey: false },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'age', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'todos',
    endpoint: '/todos?limit=50',
    schema: {
      name: 'todos',
      table: 'todos',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'todo', type: 'string', nullable: false, primaryKey: false },
        { name: 'completed', type: 'boolean', nullable: false, primaryKey: false },
        { name: 'userId', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('dummyjson')
export class DummyjsonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dummyjson', 'dummyjson', config, {
      baseUrl: config.host || 'https://dummyjson.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/products',
    });
  }
}
