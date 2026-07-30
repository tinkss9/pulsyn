// @ts-nocheck
// DingTalk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/topapi/smartwork/hrm/employee/queryonjob',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'userid', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      ],
      primaryKey: ['userid'],
    },
    idField: 'userid',
    
  },
];

@registerSource('dingtalk')
export class DingTalkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dingtalk', 'dingtalk', config, {
      baseUrl: config.host || 'https://oapi.dingtalk.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/gettoken',
      
    });
  }
}
