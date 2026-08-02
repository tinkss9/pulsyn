// ReqRes Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/api/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'first_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'last_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'avatar', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'unknown',
    endpoint: '/api/unknown',
    schema: {
      name: 'unknown',
      table: 'unknown',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'year', type: 'number', nullable: false, primaryKey: false },
        { name: 'color', type: 'string', nullable: true, primaryKey: false },
        { name: 'pantone_value', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
];

@registerSource('reqres')
export class ReqResConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reqres', 'reqres', config, {
      baseUrl: config.host || 'https://reqres.in',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/users/1',
    });
  }
}
