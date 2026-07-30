// @ts-nocheck
// LINE Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'followers',
    endpoint: '/bot/followers/ids',
    schema: {
      name: 'followers',
      table: 'followers',
      columns: [
      { name: 'userId', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['userId'],
    },
    idField: 'userId',
    
  },
];

@registerSource('line')
export class LINEConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'line', 'line', config, {
      baseUrl: config.host || 'https://api.line.me/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/bot/info',
      
    });
  }
}
