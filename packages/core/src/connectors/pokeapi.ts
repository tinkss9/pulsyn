// PokéAPI Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'pokemon',
    endpoint: '/api/v2/pokemon',
    schema: {
      name: 'pokemon',
      table: 'pokemon',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'height', type: 'number', nullable: false, primaryKey: false },
        { name: 'weight', type: 'number', nullable: false, primaryKey: false },
        { name: 'base_experience', type: 'number', nullable: true, primaryKey: false },
        { name: 'order', type: 'number', nullable: true, primaryKey: false },
        { name: 'is_default', type: 'boolean', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'berry',
    endpoint: '/api/v2/berry',
    schema: {
      name: 'berry',
      table: 'berry',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'growth_time', type: 'number', nullable: true, primaryKey: false },
        { name: 'max_harvest', type: 'number', nullable: true, primaryKey: false },
        { name: 'natural_gift_power', type: 'number', nullable: true, primaryKey: false },
        { name: 'size', type: 'number', nullable: true, primaryKey: false },
        { name: 'smoothness', type: 'number', nullable: true, primaryKey: false },
        { name: 'soil_dryness', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
  {
    name: 'ability',
    endpoint: '/api/v2/ability',
    schema: {
      name: 'ability',
      table: 'ability',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'is_main_series', type: 'boolean', nullable: true, primaryKey: false },
        { name: 'generation', type: 'json', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
];

@registerSource('pokeapi')
export class PokeAPIConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pokeapi', 'pokeapi', config, {
      baseUrl: config.host || 'https://pokeapi.co',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/v2/pokemon/pikachu',
    });
  }
}
