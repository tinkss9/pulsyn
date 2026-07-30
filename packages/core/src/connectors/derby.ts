// @ts-nocheck
// Derby Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/databases/{dbId}/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('derby')
export class DerbyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'derby', 'derby', config, {
      baseUrl: config.host || 'http://localhost:8080',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/databases',
      
    });
  }
}
