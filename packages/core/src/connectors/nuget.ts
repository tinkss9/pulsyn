// NuGet API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'packages',
    endpoint: '/registration-semver2/newtonsoft.json/index.json',
    schema: {
      name: 'packages',
      table: 'packages',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'version', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('nuget')
export class NugetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nuget', 'nuget', config, {
      baseUrl: config.host || 'https://api.nuget.org/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/registration-semver2/newtonsoft.json/index.json',
    });
  }
}
