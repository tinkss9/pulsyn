// HTTPBin v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'get',
    endpoint: '/get',
    schema: {
      name: 'get',
      table: 'get',
      columns: [
        { name: 'url', type: 'string', nullable: false, primaryKey: true },
        { name: 'headers', type: 'json', nullable: false, primaryKey: false },
        { name: 'origin', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  },
  {
    name: 'uuid',
    endpoint: '/uuid',
    schema: {
      name: 'uuid',
      table: 'uuid',
      columns: [
        { name: 'uuid', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['uuid'],
    },
    idField: 'uuid',
  }
];

@registerSource('httpbin2')
export class Httpbin2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin2', 'httpbin2', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get',
    });
  }
}
