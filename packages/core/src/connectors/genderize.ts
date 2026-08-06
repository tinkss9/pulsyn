// Genderize — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'predictions',
    endpoint: '?name=james',
    schema: {
      name: 'predictions',
      table: 'predictions',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'gender', type: 'string', nullable: false, primaryKey: false },
        { name: 'probability', type: 'number', nullable: false, primaryKey: false },
        { name: 'count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('genderize')
export class GenderizeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'genderize', 'genderize', config, {
      baseUrl: config.host || 'https://api.genderize.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
