// @ts-nocheck
// Freshsales Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'leads',
    endpoint: '/crm/sales/api/leads',
    schema: {
      name: 'leads',
      table: 'leads',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
  {
    name: 'contacts',
    endpoint: '/crm/sales/api/contacts',
    schema: {
      name: 'contacts',
      table: 'contacts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('freshsales')
export class FreshsalesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'freshsales', 'freshsales', config, {
      baseUrl: config.host || 'https://your-domain.myfreshworks.com/crm/sales/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/crm/sales/api/users/me',
      
    });
  }
}
