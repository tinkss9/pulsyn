// @ts-nocheck
// ClassLink Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('classlink')
export class ClassLinkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'classlink', 'classlink', config, {
      baseUrl: config.host || 'https://classlink.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/users',
      
    });
  }
}
