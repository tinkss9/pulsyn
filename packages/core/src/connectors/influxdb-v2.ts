// @ts-nocheck
// InfluxDB v2 Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'buckets',
    endpoint: '/buckets',
    schema: {
      name: 'buckets',
      table: 'buckets',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'retentionRules', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('influxdb-v2')
export class InfluxDBv2Connector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'influxdb-v2', 'influxdb-v2', config, {
      baseUrl: config.host || 'http://localhost:8086/api/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/buckets',
      
    });
  }
}
