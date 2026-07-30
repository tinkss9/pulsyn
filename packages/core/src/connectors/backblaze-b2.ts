// @ts-nocheck
// Backblaze B2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/b2_list_buckets',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'bucketId', type: 'string', nullable: false, primaryKey: true },
      { name: 'bucketName', type: 'string', nullable: false },
      { name: 'bucketType', type: 'string', nullable: true },
      ],
      primaryKey: ['bucketId'],
    },
    idField: 'bucketId',
    
  },
];

@registerSource('backblaze-b2')
export class BackblazeB2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'backblaze-b2', 'backblaze-b2', config, {
      baseUrl: config.host || 'https://api.backblazeb2.com/b2api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/b2_authorize_account',
      
    });
  }
}
