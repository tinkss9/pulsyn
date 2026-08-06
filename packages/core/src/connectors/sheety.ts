// Sheety API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/3a1d7a1c7d5a3a5e5a5a5a5a5a5a5a5a/pulsyn/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'email', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('sheety')
export class SheetyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sheety', 'sheety', config, {
      baseUrl: config.host || 'https://api.sheety.co',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/3a1d7a1c7d5a3a5e5a5a5a5a5a5a5a5a/pulsyn/users',
    });
  }
}
