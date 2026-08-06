// Smithsonian API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'search',
    endpoint: '/search?q=cat&rows=20&api_key=demo',
    schema: {
      name: 'search',
      table: 'search',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'string', nullable: false, primaryKey: false },
        { name: 'content', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('smithsonian')
export class SmithsonianConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'smithsonian', 'smithsonian', config, {
      baseUrl: config.host || 'https://api.si.edu/openaccess/api/v1.0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search',
    });
  }
}
