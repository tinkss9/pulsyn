// Bureau of Labor Stats — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'series',
    endpoint: '/timeseries/data/LAUCN040010000000004',
    schema: {
      name: 'series',
      table: 'series',
      columns: [
        { name: 'seriesID', type: 'string', nullable: false, primaryKey: true },
        { name: 'data', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['seriesID'],
    },
    idField: 'seriesID',
  }
];

@registerSource('bls')
export class BlsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bls', 'bls', config, {
      baseUrl: config.host || 'https://api.bls.gov/publicAPI/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/timeseries/data/LAUCN040010000000004',
    });
  }
}
