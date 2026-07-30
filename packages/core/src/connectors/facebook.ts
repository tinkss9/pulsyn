// @ts-nocheck
// Facebook Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'posts',
    endpoint: '/me/posts',
    schema: {
      name: 'posts',
      table: 'posts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'message', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('facebook')
export class FacebookConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'facebook', 'facebook', config, {
      baseUrl: config.host || 'https://graph.facebook.com/v18.0',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
