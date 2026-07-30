// @ts-nocheck
// Airtable v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/meta/bases/{baseId}/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'createdTime', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('airtable-v2')
export class Airtablev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'airtable-v2', 'airtable-v2', config, {
      baseUrl: config.host || 'https://api.airtable.com/v0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/meta/bases',
      
    });
  }
}
