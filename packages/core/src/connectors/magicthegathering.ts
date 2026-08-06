// MTG API — Community API (No Auth)
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
        { name: 'type', type: 'string', nullable: false, primaryKey: false },
        { name: 'rarity', type: 'string', nullable: false, primaryKey: false },
        { name: 'manaCost', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('magicthegathering')
export class MagicthegatheringConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'magicthegathering', 'magicthegathering', config, {
      baseUrl: config.host || 'https://api.magicthegathering.io/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/cards',
    });
  }
}
