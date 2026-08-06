// FakeStore API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'price', type: 'number', nullable: false, primaryKey: false },
        { name: 'category', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
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
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'username', type: 'string', nullable: false, primaryKey: false },
        { name: 'name', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'carts',
    endpoint: '/carts',
    schema: {
      name: 'carts',
      table: 'carts',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'userId', type: 'number', nullable: false, primaryKey: false },
        { name: 'products', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('fakestore')
export class FakestoreConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fakestore', 'fakestore', config, {
      baseUrl: config.host || 'https://fakestoreapi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/products',
    });
  }
}
