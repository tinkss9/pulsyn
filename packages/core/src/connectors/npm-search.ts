// NPM Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'search',
    endpoint: '/-/v1/search?text=express&size=20',
    schema: {
      name: 'search',
      table: 'search',
      columns: [
        { name: 'package.name', type: 'string', nullable: false, primaryKey: true },
        { name: 'package.description', type: 'string', nullable: false, primaryKey: false },
        { name: 'package.version', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['package.name'],
    },
    idField: 'package.name',
  }
];

@registerSource('npm-search')
export class NpmSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'npm-search', 'npm-search', config, {
      baseUrl: config.host || 'https://registry.npmjs.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/-/v1/search',
    });
  }
}
