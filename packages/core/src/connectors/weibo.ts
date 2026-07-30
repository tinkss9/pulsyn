// @ts-nocheck
// Weibo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'statuses',
    endpoint: '/statuses/user_timeline',
    schema: {
      name: 'statuses',
      table: 'statuses',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'text', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('weibo')
export class WeiboConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'weibo', 'weibo', config, {
      baseUrl: config.host || 'https://api.weibo.com/2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/account/profile/basic',
      
    });
  }
}
