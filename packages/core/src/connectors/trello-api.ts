// Trello API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'boards', endpoint: '/members/me/boards?limit=20', schema: { name: 'boards', table: 'boards', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'closed', type: 'boolean', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('trello-api')
export class TrelloApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trello-api', 'trello-api', config, {
      baseUrl: config.host || 'https://api.trello.com/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/members/me/boards',
    });
  }
}
