// MTG Cards — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'cards', endpoint: '/cards?pageSize=20', schema: { name: 'cards', table: 'cards', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'type', type: 'string', nullable: false, primaryKey: false }, { name: 'rarity', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('magic-cards')
export class MagicCardsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'magic-cards', 'magic-cards', config, {
      baseUrl: config.host || 'https://api.magicthegathering.io/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cards',
    });
  }
}
