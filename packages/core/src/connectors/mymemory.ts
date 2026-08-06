// MyMemory Translation — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'translate',
    endpoint: '/get?q=Hello&langpair=en|it',
    schema: {
      name: 'translate',
      table: 'translate',
      columns: [
        { name: 'responseStatus', type: 'number', nullable: false, primaryKey: true },
        { name: 'responseData', type: 'json', nullable: false, primaryKey: false }
      ],
      primaryKey: ['responseStatus'],
    },
    idField: 'responseStatus',
  }
];

@registerSource('mymemory')
export class MymemoryConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mymemory', 'mymemory', config, {
      baseUrl: config.host || 'https://api.mymemory.translated.net',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/get',
    });
  }
}
