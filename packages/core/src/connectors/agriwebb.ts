// @ts-nocheck
// AgriWebb Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'farms',
    endpoint: '/farms',
    schema: {
      name: 'farms',
      table: 'farms',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('agriwebb')
export class AgriWebbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'agriwebb', 'agriwebb', config, {
      baseUrl: config.host || 'https://api.agriwebb.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/farms',
      
    });
  }
}
