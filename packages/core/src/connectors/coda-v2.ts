// @ts-nocheck
// Coda v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/docs/{docId}/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('coda-v2')
export class Codav2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coda-v2', 'coda-v2', config, {
      baseUrl: config.host || 'https://coda.io/apis/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/whoami',
      
    });
  }
}
