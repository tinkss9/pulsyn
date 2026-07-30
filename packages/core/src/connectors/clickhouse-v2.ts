// @ts-nocheck
// ClickHouse v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/databases',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('clickhouse-v2')
export class ClickHousev2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'clickhouse-v2', 'clickhouse-v2', config, {
      baseUrl: config.host || 'https://api.clickhouse.cloud/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/queries',
      
    });
  }
}
