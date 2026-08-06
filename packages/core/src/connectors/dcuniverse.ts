// DC Universe API — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'characters',
    endpoint: '/characters?limit=20',
    schema: {
      name: 'characters',
      table: 'characters',
      columns: [
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'alias', type: 'string', nullable: false, primaryKey: false },
        { name: 'powers', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('dcuniverse')
export class DcuniverseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dcuniverse', 'dcuniverse', config, {
      baseUrl: config.host || 'https://dcuniverseapi.com/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
