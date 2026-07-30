// @ts-nocheck
// WeChat Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/user/get',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'openid', type: 'string', nullable: false, primaryKey: true },
      { name: 'nickname', type: 'string', nullable: true },
      { name: 'subscribe_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['openid'],
    },
    idField: 'openid',
    
  },
];

@registerSource('wechat')
export class WeChatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wechat', 'wechat', config, {
      baseUrl: config.host || 'https://api.weixin.qq.com/cgi-bin',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/getcallbackip',
      
    });
  }
}
