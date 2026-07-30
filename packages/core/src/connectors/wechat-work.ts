// @ts-nocheck
// WeCom Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'members',
    endpoint: '/user/list',
    schema: {
      name: 'members',
      table: 'members',
      columns: [
      { name: 'userid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['userid'],
    },
    idField: 'userid',
    
  },
];

@registerSource('wechat-work')
export class WeComConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wechat-work', 'wechat-work', config, {
      baseUrl: config.host || 'https://qyapi.weixin.qq.com/cgi-bin',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/gettoken',
      
    });
  }
}
