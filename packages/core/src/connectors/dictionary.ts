// Free Dictionary — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'entries',
    endpoint: '/entries/en/hello',
    schema: {
      name: 'entries',
      table: 'entries',
      columns: [
        { name: 'word', type: 'string', nullable: false, primaryKey: true },
        { name: 'meanings', type: 'json', nullable: false, primaryKey: false },
        { name: 'phonetics', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['word'],
    },
    idField: 'word',
  }
];

@registerSource('dictionary')
export class DictionaryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dictionary', 'dictionary', config, {
      baseUrl: config.host || 'https://api.dictionaryapi.dev/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/entries/en/hello',
    });
  }
}
