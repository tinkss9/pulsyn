// @ts-nocheck
// Naver Works Connector — Auto-generated from config
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
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['userId'],
    },
    idField: 'userId',
    
  },
];

@registerSource('naver-works')
export class NaverWorksConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'naver-works', 'naver-works', config, {
      baseUrl: config.host || 'https://www.worksapis.com/v1.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
