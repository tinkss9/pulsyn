// Agify — Community API (No Auth)
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
        { name: 'age', type: 'number', nullable: false, primaryKey: false },
        { name: 'count', type: 'number', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('agify')
export class AgifyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'agify', 'agify', config, {
      baseUrl: config.host || 'https://api.agify.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '',
    });
  }
}
