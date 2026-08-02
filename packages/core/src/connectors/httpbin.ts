// httpbin Connector — Community API (No Auth)
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
        { name: 'args', type: 'json', nullable: true, primaryKey: false },
        { name: 'headers', type: 'json', nullable: true, primaryKey: false },
        { name: 'origin', type: 'string', nullable: true, primaryKey: false },
        { name: 'url', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  },
  {
    name: 'post',
    endpoint: '/post',
    schema: {
      name: 'post',
      table: 'post',
      columns: [
        { name: 'args', type: 'json', nullable: true, primaryKey: false },
        { name: 'data', type: 'string', nullable: true, primaryKey: false },
        { name: 'files', type: 'json', nullable: true, primaryKey: false },
        { name: 'form', type: 'json', nullable: true, primaryKey: false },
        { name: 'headers', type: 'json', nullable: true, primaryKey: false },
        { name: 'json', type: 'json', nullable: true, primaryKey: false },
        { name: 'origin', type: 'string', nullable: true, primaryKey: false },
        { name: 'url', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  },
  {
    name: 'headers',
    endpoint: '/headers',
    schema: {
      name: 'headers',
      table: 'headers',
      columns: [
        { name: 'headers', type: 'json', nullable: true, primaryKey: false },
      ],
      primaryKey: [],
    },
    idField: '',
  },
];

@registerSource('httpbin')
export class HttpbinConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'httpbin', 'httpbin', config, {
      baseUrl: config.host || 'https://httpbin.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get',
    });
  }
}
