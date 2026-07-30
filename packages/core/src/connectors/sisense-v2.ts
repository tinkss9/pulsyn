// @ts-nocheck
// Sisense v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'dashboards',
    endpoint: '/dashboards',
    schema: {
      name: 'dashboards',
      table: 'dashboards',
      columns: [
      { name: 'oid', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['oid'],
    },
    idField: 'oid',
    
  },
];

@registerSource('sisense-v2')
export class Sisensev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sisense-v2', 'sisense-v2', config, {
      baseUrl: config.host || 'https://your-sisense.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/dashboards',
      
    });
  }
}
