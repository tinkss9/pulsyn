// @ts-nocheck
// Trello Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'boards', endpoint: '/1/members/me/boards', schema: { name: 'boards', table: 'boards', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'desc', type: 'string', nullable: true }, { name: 'dateLastActivity', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'dateLastActivity' },
  { name: 'cards', endpoint: '/1/boards/{boardId}/cards', schema: { name: 'cards', table: 'cards', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'desc', type: 'string', nullable: true }, { name: 'due', type: 'datetime', nullable: true },
    { name: 'dateLastActivity', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'dateLastActivity' },
];

@registerSource('trello')
export class TrelloConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trello', 'trello', config, {
      baseUrl: config.host || 'https://api.trello.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/1/members/me',
    });
  }
}
