// Adventure Time API — Community API (No Auth)
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
        { name: 'id', type: 'number', nullable: false, primaryKey: true },
        { name: 'name', type: 'string', nullable: false, primaryKey: false },
        { name: 'url', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
  }
];

@registerSource('adventure')
export class AdventureConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adventure', 'adventure', config, {
      baseUrl: config.host || 'https://adventure-time-api.herokuapp.com/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/characters',
    });
  }
}
