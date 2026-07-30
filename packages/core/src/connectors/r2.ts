// @ts-nocheck
// Cloudflare R2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'Name', type: 'string', nullable: false, primaryKey: true },
      { name: 'CreationDate', type: 'datetime', nullable: true },
      ],
      primaryKey: ['Name'],
    },
    idField: 'Name',
    
  },
];

@registerSource('r2')
export class CloudflareR2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'r2', 'r2', config, {
      baseUrl: config.host || 'https://your-account.r2.cloudflarestorage.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
