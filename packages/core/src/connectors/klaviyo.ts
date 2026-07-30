// @ts-nocheck
// Klaviyo Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'profiles',
    endpoint: '/profiles',
    schema: {
      name: 'profiles',
      table: 'profiles',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      { name: 'updated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated',
  },
];

@registerSource('klaviyo')
export class KlaviyoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'klaviyo', 'klaviyo', config, {
      baseUrl: config.host || 'https://a.klaviyo.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/profiles',
      
    });
  }
}
