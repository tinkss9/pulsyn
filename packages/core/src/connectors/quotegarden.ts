// Quote Garden — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'quotes',
    endpoint: '/quotes/random',
    schema: {
      name: 'quotes',
      table: 'quotes',
      columns: [
        { name: '_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'quoteText', type: 'string', nullable: false, primaryKey: false },
        { name: 'quoteAuthor', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['_id'],
    },
    idField: '_id',
  }
];

@registerSource('quotegarden')
export class QuotegardenConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'quotegarden', 'quotegarden', config, {
      baseUrl: config.host || 'https://quotegarden.herokuapp.com/api/v3',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/quotes/random',
    });
  }
}
