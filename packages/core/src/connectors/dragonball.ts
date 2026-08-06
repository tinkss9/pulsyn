// Dragon Ball API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/characters?limit=50',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'ki', type: 'string', nullable: false, primaryKey: false },
        { name: 'maxKi', type: 'string', nullable: false, primaryKey: false },
        { name: 'race', type: 'string', nullable: false, primaryKey: false },
        { name: 'gender', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('dragonball')
export class DragonballConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dragonball', 'dragonball', config, {
      baseUrl: config.host || 'https://dragonball-api.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
