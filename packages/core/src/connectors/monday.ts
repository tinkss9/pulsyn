// @ts-nocheck
// Monday.com Connector — Real implementation (GraphQL)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'boards', endpoint: '/v2', schema: { name: 'boards', table: 'boards', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'state', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
  { name: 'items', endpoint: '/v2', schema: { name: 'items', table: 'items', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'state', type: 'string', nullable: true }, { name: 'created_at', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('monday')
export class MondayConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'monday', 'monday', config, {
      baseUrl: config.host || 'https://api.monday.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v2',
    });
  }
}
