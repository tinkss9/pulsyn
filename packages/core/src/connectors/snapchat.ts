// @ts-nocheck
// Snapchat Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'adaccounts',
    endpoint: '/adaccounts',
    schema: {
      name: 'adaccounts',
      table: 'adaccounts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('snapchat')
export class SnapchatConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'snapchat', 'snapchat', config, {
      baseUrl: config.host || 'https://adsapi.snapchat.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
