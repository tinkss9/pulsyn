// Data.gov.uk — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'datasets',
    endpoint: '/3/action/package_search?q=health&rows=20',
    schema: {
      name: 'datasets',
      table: 'datasets',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'notes', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('data-gov-uk')
export class DataGovUkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'data-gov-uk', 'data-gov-uk', config, {
      baseUrl: config.host || 'https://data.gov.uk/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/3/action/package_search',
    });
  }
}
