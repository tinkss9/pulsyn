// ReqRes API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'email', type: 'string', nullable: false, primaryKey: false },
        { name: 'first_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'last_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'avatar', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('reqres-api')
export class ReqresApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'reqres-api', 'reqres-api', config, {
      baseUrl: config.host || 'https://reqres.in/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users',
    });
  }
}
