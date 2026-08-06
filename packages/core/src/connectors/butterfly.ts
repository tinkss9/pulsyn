// Butterfly API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'species',
    endpoint: '/species',
    schema: {
      name: 'species',
      table: 'species',
      columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'common_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'scientific_name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('butterfly')
export class ButterflyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'butterfly', 'butterfly', config, {
      baseUrl: config.host || 'https://butterfly.watch/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/species',
    });
  }
}
