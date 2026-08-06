// HP API — Community API (No Auth)
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
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'house', type: 'string', nullable: false, primaryKey: false },
        { name: 'species', type: 'string', nullable: false, primaryKey: false },
        { name: 'patronus', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('harrypotter')
export class HarrypotterConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'harrypotter', 'harrypotter', config, {
      baseUrl: config.host || 'https://hp-api.onrender.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
