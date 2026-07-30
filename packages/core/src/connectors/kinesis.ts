// @ts-nocheck
// AWS Kinesis Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'streams',
    endpoint: '/',
    schema: {
      name: 'streams',
      table: 'streams',
      columns: [
      { name: 'StreamName', type: 'string', nullable: false, primaryKey: true },
      { name: 'StreamStatus', type: 'string', nullable: true },
      { name: 'ShardCount', type: 'number', nullable: true },
      ],
      primaryKey: ['StreamName'],
    },
    idField: 'StreamName',
    
  },
];

@registerSource('kinesis')
export class AWSKinesisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kinesis', 'kinesis', config, {
      baseUrl: config.host || 'https://kinesis.us-east-1.amazonaws.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/',
      
    });
  }
}
