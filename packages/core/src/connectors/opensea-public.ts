// OpenSea Public — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'collections',
    endpoint: '/collections?limit=20',
    schema: {
      name: 'collections',
      table: 'collections',
      columns: [
        { name: 'collection', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['collection'],
    },
    idField: 'collection',
  }
];

@registerSource('opensea-public')
export class OpenseaPublicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'opensea-public', 'opensea-public', config, {
      baseUrl: config.host || 'https://api.opensea.io/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/collections',
    });
  }
}
