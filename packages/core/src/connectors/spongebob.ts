// SpongeBob API — Community API (No Auth)
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
        { name: 'name', type: 'string', nullable: false, primaryKey: true },
        { name: 'image', type: 'string', nullable: false, primaryKey: false },
        { name: 'description', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
  }
];

@registerSource('spongebob')
export class SpongebobConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'spongebob', 'spongebob', config, {
      baseUrl: config.host || 'https://spongebob-api.glitch.me',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
