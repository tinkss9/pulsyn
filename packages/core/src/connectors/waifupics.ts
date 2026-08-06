// Waifu.pics — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'sfw',
    endpoint: '/sfw/waifu',
    schema: {
      name: 'sfw',
      table: 'sfw',
      columns: [
        { name: 'url', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  }
];

@registerSource('waifupics')
export class WaifupicsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'waifupics', 'waifupics', config, {
      baseUrl: config.host || 'https://api.waifu.pics',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/sfw/waifu',
    });
  }
}
