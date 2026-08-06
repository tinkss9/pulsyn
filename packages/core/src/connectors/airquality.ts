// AQICN Air Quality — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'feed',
    endpoint: '/feed/here/?token=demo',
    schema: {
      name: 'feed',
      table: 'feed',
      columns: [
        { name: 'idx', type: 'number', nullable: false, primaryKey: true },
        { name: 'city', type: 'json', nullable: false, primaryKey: false },
        { name: 'aqi', type: 'number', nullable: false, primaryKey: false },
        { name: 'time', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['idx'],
    },
    idField: 'idx',
  }
];

@registerSource('airquality')
export class AirqualityConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'airquality', 'airquality', config, {
      baseUrl: config.host || 'https://api.waqi.info',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/feed/here/',
    });
  }
}
