// @ts-nocheck
// CleverTap Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'profiles',
    endpoint: '/profiles.json',
    schema: {
      name: 'profiles',
      table: 'profiles',
      columns: [
      { name: 'identity', type: 'string', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: true },
      { name: 'Email', type: 'string', nullable: true },
      ],
      primaryKey: ['identity'],
    },
    idField: 'identity',
    
  },
];

@registerSource('clevertap')
export class CleverTapConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clevertap', 'clevertap', config, {
      baseUrl: config.host || 'https://api.clevertap.com/1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/profiles.json',
      
    });
  }
}
