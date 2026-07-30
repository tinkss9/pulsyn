// @ts-nocheck
// Leanplum Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/getUsers',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'userId', type: 'string', nullable: false, primaryKey: true },
      { name: 'attributes', type: 'object', nullable: true },
      ],
      primaryKey: ['userId'],
    },
    idField: 'userId',
    
  },
];

@registerSource('leanplum')
export class LeanplumConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'leanplum', 'leanplum', config, {
      baseUrl: config.host || 'https://api.leanplum.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/getApp',
      
    });
  }
}
