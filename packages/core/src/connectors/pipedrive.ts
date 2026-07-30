// @ts-nocheck
// Pipedrive Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'deals', endpoint: '/api/v1/deals', schema: { name: 'deals', table: 'deals', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false },
    { name: 'value', type: 'number', nullable: true }, { name: 'status', type: 'string', nullable: true },
    { name: 'add_time', type: 'datetime', nullable: true }, { name: 'update_time', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'update_time' },
  { name: 'persons', endpoint: '/api/v1/persons', schema: { name: 'persons', table: 'persons', columns: [
    { name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'email', type: 'string', nullable: true }, { name: 'phone', type: 'string', nullable: true },
    { name: 'add_time', type: 'datetime', nullable: true }, { name: 'update_time', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id', modifiedField: 'update_time' },
];

@registerSource('pipedrive')
export class PipedriveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pipedrive', 'pipedrive', config, {
      baseUrl: config.host || 'https://api.pipedrive.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/api/v1/users/me',
    });
  }
}
