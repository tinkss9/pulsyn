// @ts-nocheck
// Amazon S3 Connector — Auto-generated from config
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

@registerSource('s3')
export class AmazonS3Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 's3', 's3', config, {
      baseUrl: config.host || 'https://s3.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
