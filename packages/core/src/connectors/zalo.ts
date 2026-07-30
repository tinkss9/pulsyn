// @ts-nocheck
// Zalo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'followers',
    endpoint: '/me/follower/get_list',
    schema: {
      name: 'followers',
      table: 'followers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('zalo')
export class ZaloConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zalo', 'zalo', config, {
      baseUrl: config.host || 'https://openapi.zalo.me/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
