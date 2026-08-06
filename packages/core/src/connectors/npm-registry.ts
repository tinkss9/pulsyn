// NPM Registry — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'package',
    endpoint: '/express',
    schema: {
      name: 'package',
      table: 'package',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'description', type: 'string', nullable: false, primaryKey: false },
        { name: 'version', type: 'string', nullable: false, primaryKey: false },
        { name: 'license', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('npm-registry')
export class NpmRegistryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'npm-registry', 'npm-registry', config, {
      baseUrl: config.host || 'https://registry.npmjs.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/express',
    });
  }
}
