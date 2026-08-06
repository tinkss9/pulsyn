// Waifu.im — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'images',
    endpoint: '/search?limit=20',
    schema: {
      name: 'images',
      table: 'images',
      columns: [
        { name: 'signature', type: 'string', nullable: false, primaryKey: true },
        { name: 'url', type: 'string', nullable: false, primaryKey: false },
        { name: 'tags', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['signature'],
    },
    idField: 'signature',
  }
];

@registerSource('waifuim')
export class WaifuimConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'waifuim', 'waifuim', config, {
      baseUrl: config.host || 'https://api.waifu.im',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search',
    });
  }
}
