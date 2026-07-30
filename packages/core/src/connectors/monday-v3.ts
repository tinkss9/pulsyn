// @ts-nocheck
// Monday v3 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'items',
    endpoint: '/boards/{boardId}/items',
    schema: {
      name: 'items',
      table: 'items',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('monday-v3')
export class Mondayv3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'monday-v3', 'monday-v3', config, {
      baseUrl: config.host || 'https://api.monday.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
