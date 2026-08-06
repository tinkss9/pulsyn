// ReqRes Users — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'users', endpoint: '/users?per_page=12', schema: { name: 'users', table: 'users', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'email', type: 'string', nullable: false, primaryKey: false }, { name: 'first_name', type: 'string', nullable: false, primaryKey: false }, { name: 'last_name', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'unknown', endpoint: '/unknown?per_page=12', schema: { name: 'unknown', table: 'unknown', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'year', type: 'number', nullable: false, primaryKey: false }, { name: 'color', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('reqres-users')
export class ReqresUsersConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reqres-users', 'reqres-users', config, {
      baseUrl: config.host || 'https://reqres.in/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users',
    });
  }
}
