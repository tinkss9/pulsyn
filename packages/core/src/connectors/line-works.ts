// @ts-nocheck
// LINE WORKS Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'userId', type: 'string', nullable: false, primaryKey: true },
      { name: 'displayName', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['userId'],
    },
    idField: 'userId',
    
  },
];

@registerSource('line-works')
export class LINEWORKSConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'line-works', 'line-works', config, {
      baseUrl: config.host || 'https://www.worksapis.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
