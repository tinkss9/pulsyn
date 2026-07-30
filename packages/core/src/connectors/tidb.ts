// @ts-nocheck
// TiDB Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'clusters',
    endpoint: '/clusters',
    schema: {
      name: 'clusters',
      table: 'clusters',
      columns: [
      { name: 'clusterId', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['clusterId'],
    },
    idField: 'clusterId',
    
  },
];

@registerSource('tidb')
export class TiDBConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tidb', 'tidb', config, {
      baseUrl: config.host || 'https://api.tidbcloud.com/v1beta',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/clusters',
      
    });
  }
}
