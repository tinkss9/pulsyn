// Star Trek API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'species',
    endpoint: '/species/search?pageSize=50',
    schema: {
      name: 'species',
      table: 'species',
      columns: [
        { name: 'uid', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'homeworld', type: 'string', nullable: false, primaryKey: false },
        { name: 'quadrant', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['uid'],
    },
    idField: 'uid',
  }
];

@registerSource('trekgeneric')
export class TrekgenericConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trekgeneric', 'trekgeneric', config, {
      baseUrl: config.host || 'https://stapi.co/api/v1/rest',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/species/search',
    });
  }
}
