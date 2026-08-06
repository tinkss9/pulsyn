// Pokemon TCG — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cards',
    endpoint: '/cards?pageSize=50',
    schema: {
      name: 'cards',
      table: 'cards',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'supertype', type: 'string', nullable: false, primaryKey: false },
        { name: 'hp', type: 'string', nullable: false, primaryKey: false },
        { name: 'types', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'types',
    endpoint: '/types',
    schema: {
      name: 'types',
      table: 'types',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('pokemontcg')
export class PokemontcgConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pokemontcg', 'pokemontcg', config, {
      baseUrl: config.host || 'https://api.pokemontcg.io/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cards',
    });
  }
}
