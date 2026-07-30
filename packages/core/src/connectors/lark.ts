// @ts-nocheck
// Lark Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/contact/v3/users',
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

@registerSource('lark')
export class LarkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lark', 'lark', config, {
      baseUrl: config.host || 'https://open.larksuite.com/open-apis',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/auth/v3/tenant_access_token/internal',
      
    });
  }
}
