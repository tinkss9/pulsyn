// @ts-nocheck
// Any.do Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tasks',
    endpoint: '/me/tasks',
    schema: {
      name: 'tasks',
      table: 'tasks',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'creation_date', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('any-do')
export class AnydoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'any-do', 'any-do', config, {
      baseUrl: config.host || 'https://sm-prod2.any.do/api/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/me',
      
    });
  }
}
