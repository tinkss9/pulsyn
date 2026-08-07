// Tencent CynosDB — Tencent CynosDB (TDSQL-C) — cloud-native MySQL/PostgreSQL compatible
// Auth: Tencent Cloud API Key
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'clusters', endpoint: '/?Action=DescribeClusters', schema: { name: 'clusters', table: 'clusters', columns: [{ name: 'ClusterId', type: 'string', nullable: false, primaryKey: true }, { name: 'ClusterName', type: 'string', nullable: false, primaryKey: false }, { name: 'Status', type: 'string', nullable: false, primaryKey: false }, { name: 'Engine', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['ClusterId'] }, idField: 'ClusterId' }
];

@registerSource('cynosdb')
export class CynosdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cynosdb', 'cynosdb', config, {
      baseUrl: config.host || 'https://cynosdb.tencentcloudapi.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
