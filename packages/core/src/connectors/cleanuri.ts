// CleanURI — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shorten',
    endpoint: '/shorten',
    schema: {
      name: 'shorten',
      table: 'shorten',
      columns: [
        { name: 'result_url', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['result_url'],
    },
    idField: 'result_url',
  }
];

@registerSource('cleanuri')
export class CleanuriConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cleanuri', 'cleanuri', config, {
      baseUrl: config.host || 'https://cleanuri.com/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/shorten',
    });
  }
}
