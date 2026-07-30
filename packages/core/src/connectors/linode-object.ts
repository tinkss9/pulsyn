// @ts-nocheck
// Linode Object Storage Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/object-storage/buckets',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'label', type: 'string', nullable: false, primaryKey: true },
      { name: 'cluster', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['label'],
    },
    idField: 'label',
    
  },
];

@registerSource('linode-object')
export class LinodeObjectStorageConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'linode-object', 'linode-object', config, {
      baseUrl: config.host || 'https://api.linode.com/v4',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/object-storage/buckets',
      
    });
  }
}
