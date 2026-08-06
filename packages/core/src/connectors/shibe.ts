// Shibe Online — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'shibes',
    endpoint: '/shibes?count=10',
    schema: {
      name: 'shibes',
      table: 'shibes',
      columns: [
        { name: 'url', type: 'string', nullable: false, primaryKey: true }
      ],
      primaryKey: ['url'],
    },
    idField: 'url',
  }
];

@registerSource('shibe')
export class ShibeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shibe', 'shibe', config, {
      baseUrl: config.host || 'https://shibe.online/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/shibes',
    });
  }
}
