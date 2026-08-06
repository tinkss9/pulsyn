// Open-Meteo Weather — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'forecast', endpoint: '/forecast?latitude=52.52&longitude=13.41&current_weather=true', schema: { name: 'forecast', table: 'forecast', columns: [{ name: 'latitude', type: 'number', nullable: false, primaryKey: false }, { name: 'longitude', type: 'number', nullable: false, primaryKey: false }, { name: 'current_weather', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['latitude'] }, idField: 'latitude' }
];

@registerSource('open-meteo')
export class OpenMeteoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'open-meteo', 'open-meteo', config, {
      baseUrl: config.host || 'https://api.open-meteo.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/forecast',
    });
  }
}
