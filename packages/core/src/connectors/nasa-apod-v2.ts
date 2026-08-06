// NASA APOD v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'apod', endpoint: '/apod?api_key=DEMO_KEY&count=5', schema: { name: 'apod', table: 'apod', columns: [{ name: 'date', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'explanation', type: 'string', nullable: false, primaryKey: false }, { name: 'url', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['date'] }, idField: 'date' }
];

@registerSource('nasa-apod-v2')
export class NasaApodV2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nasa-apod-v2', 'nasa-apod-v2', config, {
      baseUrl: config.host || 'https://api.nasa.gov/planetary',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/apod',
    });
  }
}
