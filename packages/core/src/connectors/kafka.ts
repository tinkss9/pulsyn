// @ts-nocheck
// Kafka Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'topics',
    endpoint: '/v3/clusters/{clusterId}/topics',
    schema: {
      name: 'topics',
      table: 'topics',
      columns: [
      { name: 'topic_name', type: 'string', nullable: false, primaryKey: true },
      { name: 'partitions_count', type: 'number', nullable: true },
      { name: 'replication_factor', type: 'number', nullable: true },
      ],
      primaryKey: ['topic_name'],
    },
    idField: 'topic_name',
    
  },
];

@registerSource('kafka')
export class KafkaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kafka', 'kafka', config, {
      baseUrl: config.host || 'http://localhost:8082',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v3/clusters',
      
    });
  }
}
