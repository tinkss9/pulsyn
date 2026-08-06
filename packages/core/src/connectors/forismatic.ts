// Forismatic Quotes — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/?method=getQuote&format=json&lang=en',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: 'quoteText', type: 'string', nullable: false, primaryKey: true },
        { name: 'quoteAuthor', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['quoteText'],
    },
    idField: 'quoteText',
  }
];

@registerSource('forismatic')
export class ForismaticConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'forismatic', 'forismatic', config, {
      baseUrl: config.host || 'https://api.forismatic.com/api/1.0',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
