// @ts-nocheck
// Groove Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tickets',
    endpoint: '/tickets',
    schema: {
      name: 'tickets',
      table: 'tickets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'subject', type: 'string', nullable: false },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('groove')
export class GrooveConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'groove', 'groove', config, {
      baseUrl: config.host || 'https://api.groovehq.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tickets',
      
    });
  }
}
