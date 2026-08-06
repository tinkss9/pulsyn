// Airport Info — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'airports',
    endpoint: '/airport?iata=LAX',
    schema: {
      name: 'airports',
      table: 'airports',
      columns: [
        { name: 'iata', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'city', type: 'string', nullable: false, primaryKey: false },
        { name: 'country', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['iata'],
    },
    idField: 'iata',
  }
];

@registerSource('airport-info')
export class AirportInfoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'airport-info', 'airport-info', config, {
      baseUrl: config.host || 'https://airport-info.p.rapidapi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/airport',
    });
  }
}
