// Open Meteo Weather API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'weather',
    endpoint: '/v1/forecast',
    schema: {
      name: 'weather',
      table: 'weather',
      columns: [
        { name: 'latitude', type: 'number', nullable: false, primaryKey: false },
        { name: 'longitude', type: 'number', nullable: false, primaryKey: false },
        { name: 'timezone', type: 'string', nullable: true, primaryKey: false },
        { name: 'current_temperature', type: 'number', nullable: true, primaryKey: false },
        { name: 'current_humidity', type: 'number', nullable: true, primaryKey: false },
        { name: 'current_wind_speed', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['latitude', 'longitude'],
    },
    idField: 'latitude',
  },
];

@registerSource('openmeteo')
export class OpenMeteoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openmeteo', 'openmeteo', config, {
      baseUrl: config.host || 'https://api.open-meteo.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v1/forecast?latitude=-33.8688&longitude=151.2093&current_weather=true',
    });
  }
}
