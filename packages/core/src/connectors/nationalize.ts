// Nationalize — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'predictions',
    endpoint: '?name=michael',
    schema: {
      name: 'predictions',
      table: 'predictions',
      columns: [
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'country', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('nationalize')
export class NationalizeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nationalize', 'nationalize', config, {
      baseUrl: config.host || 'https://api.nationalize.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
