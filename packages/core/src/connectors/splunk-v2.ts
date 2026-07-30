// @ts-nocheck
// Splunk v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'saved_searches',
    endpoint: '/saved/searches',
    schema: {
      name: 'saved_searches',
      table: 'saved_searches',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'search', type: 'string', nullable: true },
      { name: 'updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('splunk-v2')
export class Splunkv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'splunk-v2', 'splunk-v2', config, {
      baseUrl: config.host || 'https://your-splunk.com:8089/services',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/server/info',
      
    });
  }
}
