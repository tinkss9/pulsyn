// @ts-nocheck
// Greenhouse Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/jobs',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
  {
    name: 'candidates',
    endpoint: '/candidates',
    schema: {
      name: 'candidates',
      table: 'candidates',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('greenhouse')
export class GreenhouseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'greenhouse', 'greenhouse', config, {
      baseUrl: config.host || 'https://harvest.greenhouse.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'per_page',
      healthEndpoint: '/jobs',
      
    });
  }
}
