// FRED Economic Data — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'series',
    endpoint: '/series/search?search_text=gdp&api_key=DEMO_KEY&file_type=json&limit=20',
    schema: {
      name: 'series',
      table: 'series',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'frequency', type: 'string', nullable: false, primaryKey: false },
        { name: 'units', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('fred')
export class FredConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'fred', 'fred', config, {
      baseUrl: config.host || 'https://api.stlouisfed.org/fred',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/series/search',
    });
  }
}
