// Disease.sh COVID — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'global',
    endpoint: '/all',
    schema: {
      name: 'global',
      table: 'global',
      columns: [
        { name: 'cases', type: 'number', nullable: false, primaryKey: false },
        { name: 'deaths', type: 'number', nullable: false, primaryKey: false },
        { name: 'recovered', type: 'number', nullable: false, primaryKey: false },
        { name: 'active', type: 'number', nullable: false, primaryKey: false },
        { name: 'updated', type: 'number', nullable: false, primaryKey: true }
      ],
      primaryKey: ['updated'],
    },
    idField: 'updated',
  },
  {
    name: 'countries',
    endpoint: '/countries?limit=50',
    schema: {
      name: 'countries',
      table: 'countries',
      columns: [
        { name: 'country', type: 'string', nullable: false, primaryKey: true },
        { name: 'cases', type: 'number', nullable: false, primaryKey: false },
        { name: 'deaths', type: 'number', nullable: false, primaryKey: false },
        { name: 'recovered', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['country'],
    },
    idField: 'country',
  }
];

@registerSource('disease-sh')
export class DiseaseShConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'disease-sh', 'disease-sh', config, {
      baseUrl: config.host || 'https://disease.sh/v3/covid-19',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/all',
    });
  }
}
