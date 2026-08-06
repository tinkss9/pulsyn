// Data.gov — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'usda',
    endpoint: '/usda/ndb/search/?api_key=DEMO_KEY&q=butter&max=25',
    schema: {
      name: 'usda',
      table: 'usda',
      columns: [
        { name: 'ndbno', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'group', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['ndbno'],
    },
    idField: 'ndbno',
  }
];

@registerSource('data-gov')
export class DataGovConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'data-gov', 'data-gov', config, {
      baseUrl: config.host || 'https://api.data.gov',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/usda/ndb/search/',
    });
  }
}
