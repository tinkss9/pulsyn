// PyPI — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'package',
    endpoint: '/requests/json',
    schema: {
      name: 'package',
      table: 'package',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'summary', type: 'string', nullable: false, primaryKey: false },
        { name: 'version', type: 'string', nullable: false, primaryKey: false },
        { name: 'license', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('pypi')
export class PypiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pypi', 'pypi', config, {
      baseUrl: config.host || 'https://pypi.org/pypi',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/requests/json',
    });
  }
}
