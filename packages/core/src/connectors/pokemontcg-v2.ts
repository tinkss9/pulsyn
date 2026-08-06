// Pokemon TCG v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'cards', endpoint: '/cards?pageSize=20', schema: { name: 'cards', table: 'cards', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'supertype', type: 'string', nullable: false, primaryKey: false }, { name: 'hp', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('pokemontcg-v2')
export class PokemontcgV2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pokemontcg-v2', 'pokemontcg-v2', config, {
      baseUrl: config.host || 'https://api.pokemontcg.io/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cards',
    });
  }
}
