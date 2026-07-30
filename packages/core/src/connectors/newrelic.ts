// @ts-nocheck
// New Relic Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'applications',
    endpoint: '/applications.json',
    schema: {
      name: 'applications',
      table: 'applications',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'language', type: 'string', nullable: true },
      { name: 'last_reported_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('newrelic')
export class NewRelicConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'newrelic', 'newrelic', config, {
      baseUrl: config.host || 'https://api.newrelic.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users.json',
      
    });
  }
}
