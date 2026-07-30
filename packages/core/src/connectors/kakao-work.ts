// @ts-nocheck
// Kakao Work Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users.list',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('kakao-work')
export class KakaoWorkConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kakao-work', 'kakao-work', config, {
      baseUrl: config.host || 'https://api.kakaowork.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users.me',
      
    });
  }
}
