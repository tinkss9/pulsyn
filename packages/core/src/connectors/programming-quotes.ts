// Programming Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quotes/random/50',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'en', type: 'string', nullable: false, primaryKey: false },
        { name: 'author', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('programming-quotes')
export class ProgrammingQuotesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'programming-quotes', 'programming-quotes', config, {
      baseUrl: config.host || 'https://programming-quotes-api.azurewebsites.net/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes/random/50',
    });
  }
}
