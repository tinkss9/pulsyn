// Random User API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/api',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'gender', type: 'string', nullable: true, primaryKey: false },
        { name: 'name_first', type: 'string', nullable: true, primaryKey: false },
        { name: 'name_last', type: 'string', nullable: true, primaryKey: false },
        { name: 'email', type: 'string', nullable: true, primaryKey: false },
        { name: 'phone', type: 'string', nullable: true, primaryKey: false },
        { name: 'location_city', type: 'string', nullable: true, primaryKey: false },
        { name: 'location_country', type: 'string', nullable: true, primaryKey: false },
        { name: 'nat', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['email'],
    },
    idField: 'email',
  },
];

@registerSource('randomuser')
export class RandomUserConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'randomuser', 'randomuser', config, {
      baseUrl: config.host || 'https://randomuser.me',
      authType: 'apikey',
      engine: 'randomuser',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api',
    });
  }
}
