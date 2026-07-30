// @ts-nocheck
// Airtable Connector — Real implementation
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  { name: 'tables', endpoint: '/meta/bases/{baseId}/tables', schema: { name: 'tables', table: 'tables', columns: [
    { name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false },
    { name: 'createdTime', type: 'datetime', nullable: true },
  ], primaryKey: ['id'] }, idField: 'id' },
];

@registerSource('airtable')
export class AirtableConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'airtable', 'airtable', config, {
      baseUrl: config.host || 'https://api.airtable.com/v0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/meta/bases',
    });
  }
}
