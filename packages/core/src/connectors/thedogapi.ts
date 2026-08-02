// The Dog API Connector — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'breeds',
    endpoint: '/v1/breeds',
    schema: {
      name: 'breeds',
      table: 'breeds',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'bred_for', type: 'string', nullable: true, primaryKey: false },
        { name: 'breed_group', type: 'string', nullable: true, primaryKey: false },
        { name: 'life_span', type: 'string', nullable: true, primaryKey: false },
        { name: 'temperament', type: 'string', nullable: true, primaryKey: false },
        { name: 'origin', type: 'string', nullable: true, primaryKey: false },
        { name: 'weight_imperial', type: 'string', nullable: true, primaryKey: false },
        { name: 'height_imperial', type: 'string', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
];

@registerSource('thedogapi')
export class TheDogAPIConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thedogapi', 'thedogapi', config, {
      baseUrl: config.host || 'https://api.thedogapi.com',
      authType: 'apikey',
      engine: 'thedogapi',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v1/breeds',
    });
  }
}
