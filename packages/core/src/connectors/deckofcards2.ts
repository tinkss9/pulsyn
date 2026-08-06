// Deck of Cards — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'deck',
    endpoint: '/new/shuffle/?deck_count=1',
    schema: {
      name: 'deck',
      table: 'deck',
      columns: [
        { name: 'deck_id', type: 'string', nullable: false, primaryKey: true },
        { name: 'remaining', type: 'number', nullable: false, primaryKey: false },
        { name: 'shuffled', type: 'boolean', nullable: false, primaryKey: false }
      ],
      primaryKey: ['deck_id'],
    },
    idField: 'deck_id',
  }
];

@registerSource('deckofcards2')
export class Deckofcards2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deckofcards2', 'deckofcards2', config, {
      baseUrl: config.host || 'https://deckofcardsapi.com/api/deck',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/new/shuffle/',
    });
  }
}
