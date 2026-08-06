// Scryfall Cards — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'cards', endpoint: '/cards/search?q=c%3Ared+cmc%3D1&page=1', schema: { name: 'cards', table: 'cards', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'type_line', type: 'string', nullable: false, primaryKey: false }, { name: 'mana_cost', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('scryfall-cards')
export class ScryfallCardsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'scryfall-cards', 'scryfall-cards', config, {
      baseUrl: config.host || 'https://api.scryfall.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cards/search',
    });
  }
}
