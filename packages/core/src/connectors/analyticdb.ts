// Alibaba AnalyticDB — Alibaba AnalyticDB — real-time OLAP, data warehouse
// Auth: Alibaba Cloud AccessKey
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'clusters', endpoint: '/?Action=DescribeDBClusters', schema: { name: 'clusters', table: 'clusters', columns: [{ name: 'DBClusterId', type: 'string', nullable: false, primaryKey: true }, { name: 'DBClusterDescription', type: 'string', nullable: false, primaryKey: false }, { name: 'Status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['DBClusterId'] }, idField: 'DBClusterId' }
];

@registerSource('analyticdb')
export class AnalyticdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'analyticdb', 'analyticdb', config, {
      baseUrl: config.host || 'https://adb.aliyuncs.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
