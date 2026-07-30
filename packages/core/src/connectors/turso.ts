// @ts-nocheck
// Turso Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/organizations/{orgName}/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('turso')
export class TursoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'turso', 'turso', config, {
      baseUrl: config.host || 'https://api.turso.tech/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/organizations',
      
    });
  }
}
