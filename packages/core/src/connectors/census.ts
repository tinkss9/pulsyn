// US Census — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'data',
    endpoint: '/data/2019/acs/acs5?get=NAME,B01001_001E&for=state:*',
    schema: {
      name: 'data',
      table: 'data',
      columns: [
        { name: 'NAME', type: 'string', nullable: false, primaryKey: true },
        { name: 'B01001_001E', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['NAME'],
    },
    idField: 'NAME',
  }
];

@registerSource('census')
export class CensusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'census', 'census', config, {
      baseUrl: config.host || 'https://api.census.gov',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/data/2019/acs/acs5',
    });
  }
}
