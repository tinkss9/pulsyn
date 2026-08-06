// jsDelivr Stats — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'packages',
    endpoint: '/packages/npm/express',
    schema: {
      name: 'packages',
      table: 'packages',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'latest', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('jsdelivr')
export class JsdelivrConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'jsdelivr', 'jsdelivr', config, {
      baseUrl: config.host || 'https://data.jsdelivr.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/packages/npm/express',
    });
  }
}
