// WeatherAPI — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'current',
    endpoint: '/current.json?key=demo&q=London',
    schema: {
      name: 'current',
      table: 'current',
      columns: [
        { name: 'location', type: 'json', nullable: false, primaryKey: true },
        { name: 'current', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['location'],
    },
    idField: 'location',
  }
];

@registerSource('weatherapi')
export class WeatherapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'weatherapi', 'weatherapi', config, {
      baseUrl: config.host || 'https://api.weatherapi.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/current.json',
    });
  }
}
