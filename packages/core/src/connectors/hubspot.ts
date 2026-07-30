// @ts-nocheck
// HubSpot Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contacts',
    endpoint: '/crm/v3/objects/contacts',
    schema: { name: 'contacts', table: 'contacts', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'firstname', type: 'string', nullable: true },
      { name: 'lastname', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'phone', type: 'string', nullable: true },
      { name: 'createdate', type: 'datetime', nullable: true },
      { name: 'lastmodifieddate', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'lastmodifieddate',
  },
  {
    name: 'companies',
    endpoint: '/crm/v3/objects/companies',
    schema: { name: 'companies', table: 'companies', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'domain', type: 'string', nullable: true },
      { name: 'industry', type: 'string', nullable: true },
      { name: 'createdate', type: 'datetime', nullable: true },
      { name: 'lastmodifieddate', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'lastmodifieddate',
  },
  {
    name: 'deals',
    endpoint: '/crm/v3/objects/deals',
    schema: { name: 'deals', table: 'deals', columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'dealname', type: 'string', nullable: false },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'dealstage', type: 'string', nullable: true },
      { name: 'closedate', type: 'date', nullable: true },
      { name: 'createdate', type: 'datetime', nullable: true },
      { name: 'lastmodifieddate', type: 'datetime', nullable: true },
    ], primaryKey: ['id'] },
    idField: 'id',
    modifiedField: 'lastmodifieddate',
  },
];

@registerSource('hubspot')
export class HubspotConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'hubspot', 'hubspot', config, {
      baseUrl: config.host || 'https://api.hubapi.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/crm/v3/objects/contacts?limit=1',
      rateLimit: { requests: 100, windowMs: 10000 },
    });
  }
}
