// D&D 5e Spells — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'spells', endpoint: '/spells/?limit=20', schema: { name: 'spells', table: 'spells', columns: [{ name: 'slug', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'level', type: 'string', nullable: false, primaryKey: false }, { name: 'school', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['slug'] }, idField: 'slug' },
{ name: 'monsters', endpoint: '/monsters/?limit=20', schema: { name: 'monsters', table: 'monsters', columns: [{ name: 'slug', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'type', type: 'string', nullable: false, primaryKey: false }, { name: 'challenge_rating', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['slug'] }, idField: 'slug' }
];

@registerSource('open5e-spells')
export class Open5eSpellsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'open5e-spells', 'open5e-spells', config, {
      baseUrl: config.host || 'https://api.open5e.com/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/spells/',
    });
  }
}
