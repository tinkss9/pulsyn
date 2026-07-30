// @ts-nocheck
// Google Cloud Storage Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/b',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'timeCreated', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('gcs')
export class GoogleCloudStorageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gcs', 'gcs', config, {
      baseUrl: config.host || 'https://storage.googleapis.com/storage/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/b',
      
    });
  }
}
