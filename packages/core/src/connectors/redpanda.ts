// @ts-nocheck
// Redpanda Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'topics',
    endpoint: '/topics',
    schema: {
      name: 'topics',
      table: 'topics',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'partition_count', type: 'number', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('redpanda')
export class RedpandaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'redpanda', 'redpanda', config, {
      baseUrl: config.host || 'http://localhost:9644/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/brokers',
      
    });
  }
}
