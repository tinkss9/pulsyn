// NASA APOD — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'apod',
    endpoint: '/apod?api_key=DEMO_KEY',
    schema: {
      name: 'apod',
      table: 'apod',
      columns: [
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'explanation', type: 'string', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false },
        { name: 'date', type: 'string', nullable: false, primaryKey: true },
        { name: 'media_type', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['date'],
    },
    idField: 'date',
  }
];

@registerSource('nasa-apod')
export class NasaApodConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nasa-apod', 'nasa-apod', config, {
      baseUrl: config.host || 'https://api.nasa.gov/planetary',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/apod',
    });
  }
}
