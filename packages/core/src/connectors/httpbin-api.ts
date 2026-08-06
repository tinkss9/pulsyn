// HTTPBin API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'ip',
    endpoint: '/ip',
    schema: {
      name: 'ip',
      table: 'ip',
      columns: [
        { name: 'origin', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['origin'],
    },
    idField: 'origin',
  },
  {
    name: 'headers',
    endpoint: '/headers',
    schema: {
      name: 'headers',
      table: 'headers',
      columns: [
        { name: 'headers', type: 'json', nullable: false, primaryKey: true }
      ],
      primaryKey: ['headers'],
    },
    idField: 'headers',
  },
  {
    name: 'user_agent',
    endpoint: '/user-agent',
    schema: {
      name: 'user_agent',
      table: 'user_agent',
      columns: [
        { name: 'user-agent', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['user-agent'],
    },
    idField: 'user-agent',
  }
];

@registerSource('httpbin-api')
export class HttpbinApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin-api', 'httpbin-api', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/ip',
    });
  }
}
