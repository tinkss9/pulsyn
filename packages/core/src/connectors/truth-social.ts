// @ts-nocheck
// Truth Social Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'statuses',
    endpoint: '/statuses',
    schema: {
      name: 'statuses',
      table: 'statuses',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'content', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('truth-social')
export class TruthSocialConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'truth-social', 'truth-social', config, {
      baseUrl: config.host || 'https://truthsocial.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts/verify_credentials',
      
    });
  }
}
