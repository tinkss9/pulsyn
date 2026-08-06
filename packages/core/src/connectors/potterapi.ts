// Potter API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/characters',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'index', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'nickname', type: 'string', nullable: false, primaryKey: false },
        { name: 'hogwartsHouse', type: 'string', nullable: false, primaryKey: false },
        { name: 'interpretedBy', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['index'],
    },
    idField: 'index',
  },
  {
    name: 'spells',
    endpoint: '/spells',
    schema: {
      name: 'spells',
      table: 'spells',
      columns: [
        { name: 'index', type: 'number', nullable: false, primaryKey: true },
        { name: 'spell', type: 'string', nullable: false, primaryKey: false },
        { name: 'use', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['index'],
    },
    idField: 'index',
  }
];

@registerSource('potterapi')
export class PotterapiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'potterapi', 'potterapi', config, {
      baseUrl: config.host || 'https://potterapi-fedeperin.vercel.app/en',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
