// Europeana — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'search',
    endpoint: '/search.json?query=cat&rows=20&wskey=demo',
    schema: {
      name: 'search',
      table: 'search',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'title', type: 'json', nullable: false, primaryKey: false },
        { name: 'type', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('europeana')
export class EuropeanaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'europeana', 'europeana', config, {
      baseUrl: config.host || 'https://api.europeana.eu/record/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.json',
    });
  }
}
