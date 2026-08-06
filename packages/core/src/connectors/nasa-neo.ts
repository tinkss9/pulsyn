// NASA Near Earth Objects — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'neo',
    endpoint: '/feed?start_date=2026-08-01&end_date=2026-08-02&api_key=DEMO_KEY',
    schema: {
      name: 'neo',
      table: 'neo',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'nasa_jpl_url', type: 'string', nullable: false, primaryKey: false },
        { name: 'absolute_magnitude_h', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('nasa-neo')
export class NasaNeoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nasa-neo', 'nasa-neo', config, {
      baseUrl: config.host || 'https://api.nasa.gov/neo/rest/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/feed',
    });
  }
}
