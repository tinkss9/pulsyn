// HTTPBin v3 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'get',
    endpoint: '/get?foo=bar',
    schema: {
      name: 'get',
      table: 'get',
      columns: [
        { name: 'args', type: 'json', nullable: false, primaryKey: true },
        { name: 'headers', type: 'json', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['args'],
    },
    idField: 'args',
  }
];

@registerSource('httpbin3')
export class Httpbin3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin3', 'httpbin3', config, {
      baseUrl: config.host || 'https://postman-echo.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get',
    });
  }
}
