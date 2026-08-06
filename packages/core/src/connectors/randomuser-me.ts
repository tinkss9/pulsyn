// RandomUser.me — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'users', endpoint: '/?results=20', schema: { name: 'users', table: 'users', columns: [{ name: 'login.uuid', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'json', nullable: false, primaryKey: false }, { name: 'email', type: 'string', nullable: false, primaryKey: false }, { name: 'location', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['login.uuid'] }, idField: 'login.uuid' }
];

@registerSource('randomuser-me')
export class RandomuserMeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'randomuser-me', 'randomuser-me', config, {
      baseUrl: config.host || 'https://randomuser.me/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
