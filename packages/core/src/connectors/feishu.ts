// @ts-nocheck
// Feishu Connector — Auto-generated from config
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
      { name: 'user_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['user_id'],
    },
    idField: 'user_id',
    
  },
];

@registerSource('feishu')
export class FeishuConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'feishu', 'feishu', config, {
      baseUrl: config.host || 'https://open.feishu.cn/open-apis',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/auth/v3/tenant_access_token/internal',
      
    });
  }
}
