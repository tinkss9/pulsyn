// LibreTranslate — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'languages',
    endpoint: '/languages',
    schema: {
      name: 'languages',
      table: 'languages',
      columns: [
        { name: 'code', type: 'string', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['code'],
    },
    idField: 'code',
  }
];

@registerSource('libretranslate')
export class LibretranslateConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'libretranslate', 'libretranslate', config, {
      baseUrl: config.host || 'https://libretranslate.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/languages',
    });
  }
}
