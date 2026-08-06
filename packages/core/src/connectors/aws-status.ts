// AWS Health — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/health/status', schema: { name: 'status', table: 'status', columns: [{ name: 'service', type: 'string', nullable: false, primaryKey: true }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['service'] }, idField: 'service' }
];

@registerSource('aws-status')
export class AwsStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aws-status', 'aws-status', config, {
      baseUrl: config.host || 'https://health.aws.amazon.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/health/status',
    });
  }
}
