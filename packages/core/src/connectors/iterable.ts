// @ts-nocheck
// Iterable Connector — Auto-generated from config
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
      { name: 'email', type: 'string', nullable: true },
      { name: 'firstName', type: 'string', nullable: true },
      { name: 'lastName', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['userId'],
    },
    idField: 'userId',
    
  },
];

@registerSource('iterable')
export class IterableConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'iterable', 'iterable', config, {
      baseUrl: config.host || 'https://api.iterable.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
