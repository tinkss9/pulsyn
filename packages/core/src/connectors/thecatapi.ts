// The Cat API Connector — Community API (No Auth)
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
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'temperament', type: 'string', nullable: true, primaryKey: false },
        { name: 'origin', type: 'string', nullable: true, primaryKey: false },
        { name: 'description', type: 'string', nullable: true, primaryKey: false },
        { name: 'life_span', type: 'string', nullable: true, primaryKey: false },
        { name: 'adaptability', type: 'number', nullable: true, primaryKey: false },
        { name: 'affection_level', type: 'number', nullable: true, primaryKey: false },
        { name: 'child_friendly', type: 'number', nullable: true, primaryKey: false },
        { name: 'dog_friendly', type: 'number', nullable: true, primaryKey: false },
        { name: 'energy_level', type: 'number', nullable: true, primaryKey: false },
        { name: 'intelligence', type: 'number', nullable: true, primaryKey: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  },
];

@registerSource('thecatapi')
export class TheCatAPIConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'thecatapi', 'thecatapi', config, {
      baseUrl: config.host || 'https://api.thecatapi.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/v1/breeds',
    });
  }
}
