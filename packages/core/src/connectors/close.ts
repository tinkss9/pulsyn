// @ts-nocheck
// Close Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/api/v1/lead/',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'url', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      { name: 'date_updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_updated',
  },
  {
    name: 'contacts',
    endpoint: '/api/v1/contact/',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_updated',
  },
];

@registerSource('close')
export class CloseConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'close', 'close', config, {
      baseUrl: config.host || 'https://api.close.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/api/v1/me/',
      
    });
  }
}
