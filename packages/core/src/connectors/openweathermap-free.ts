// OpenWeatherMap Free — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'weather', endpoint: '/weather?q=London&appid=demo', schema: { name: 'weather', table: 'weather', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'main', type: 'json', nullable: false, primaryKey: false }, { name: 'weather', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('openweathermap-free')
export class OpenweathermapFreeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openweathermap-free', 'openweathermap-free', config, {
      baseUrl: config.host || 'https://api.openweathermap.org/data/2.5',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/weather',
    });
  }
}
