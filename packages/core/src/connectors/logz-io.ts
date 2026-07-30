// @ts-nocheck
// Logz.io Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'alerts',
    endpoint: '/v2/alerts',
    schema: {
      name: 'alerts',
      table: 'alerts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'severity', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('logz-io')
export class LogzioConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'logz-io', 'logz-io', config, {
      baseUrl: config.host || 'https://api.logz.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/search',
      
    });
  }
}
