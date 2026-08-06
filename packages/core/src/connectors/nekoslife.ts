// Nekos.life — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'img',
    endpoint: '/img/waifu',
    schema: {
      name: 'img',
      table: 'img',
      columns: [
        { name: 'url', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  }
];

@registerSource('nekoslife')
export class NekoslifeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'nekoslife', 'nekoslife', config, {
      baseUrl: config.host || 'https://nekos.life/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/img/waifu',
    });
  }
}
