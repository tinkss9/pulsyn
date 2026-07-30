// @ts-nocheck
// Cloudflare Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'zones',
    endpoint: '/zones',
    schema: {
      name: 'zones',
      table: 'zones',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_on', type: 'datetime', nullable: true },
      { name: 'modified_on', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'modified_on',
  },
];

@registerSource('cloudflare')
export class CloudflareConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cloudflare', 'cloudflare', config, {
      baseUrl: config.host || 'https://api.cloudflare.com/client/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/user',
      
    });
  }
}
