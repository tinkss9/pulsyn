// @ts-nocheck
// Trello v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cards',
    endpoint: '/boards/{boardId}/cards',
    schema: {
      name: 'cards',
      table: 'cards',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'due', type: 'datetime', nullable: true },
      { name: 'dateLastActivity', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'dateLastActivity',
  },
];

@registerSource('trello-v2')
export class Trellov2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'trello-v2', 'trello-v2', config, {
      baseUrl: config.host || 'https://api.trello.com/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/members/me',
      
    });
  }
}
