// @ts-nocheck
// OmniFocus Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/tasks',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'completed', type: 'boolean', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('omnifocus')
export class OmniFocusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'omnifocus', 'omnifocus', config, {
      baseUrl: config.host || 'https://api.omnigroup.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/tasks',
      
    });
  }
}
