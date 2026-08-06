// European Central Bank — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'exchange_rates',
    endpoint: '/EXR/D.USD.EUR.SP00.A?format=csvdata&lastNObservations=10',
    schema: {
      name: 'exchange_rates',
      table: 'exchange_rates',
      columns: [
        { name: 'TIME_PERIOD', type: 'string', nullable: false, primaryKey: true },
        { name: 'OBS_VALUE', type: 'string', nullable: false, primaryKey: false },
        { name: 'CURRENCY', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['TIME_PERIOD'],
    },
    idField: 'TIME_PERIOD',
  }
];

@registerSource('ecb')
export class EcbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'ecb', 'ecb', config, {
      baseUrl: config.host || 'https://data-api.ecb.europa.eu/service/data',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/EXR/D.USD.EUR.SP00.A',
    });
  }
}
