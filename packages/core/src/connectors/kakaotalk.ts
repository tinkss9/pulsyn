// @ts-nocheck
// KakaoTalk Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'friends',
    endpoint: '/api/talk/friends',
    schema: {
      name: 'friends',
      table: 'friends',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'nickname', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('kakaotalk')
export class KakaoTalkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kakaotalk', 'kakaotalk', config, {
      baseUrl: config.host || 'https://kapi.kakao.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/user/me',
      
    });
  }
}
