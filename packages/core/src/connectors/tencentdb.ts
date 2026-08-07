// Tencent Cloud DB — Tencent Cloud MySQL/PostgreSQL/SQL Server — largest Chinese cloud DB provider
// Auth: Tencent Cloud API Key (SecretId + SecretKey)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'instances', endpoint: '/?Action=DescribeDBInstances', schema: { name: 'instances', table: 'instances', columns: [{ name: 'InstanceId', type: 'string', nullable: false, primaryKey: true }, { name: 'InstanceName', type: 'string', nullable: false, primaryKey: false }, { name: 'Status', type: 'string', nullable: false, primaryKey: false }, { name: 'Engine', type: 'string', nullable: false, primaryKey: false }, { name: 'EngineVersion', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['InstanceId'] }, idField: 'InstanceId' },
{ name: 'databases', endpoint: '/?Action=DescribeDatabases', schema: { name: 'databases', table: 'databases', columns: [{ name: 'DatabaseName', type: 'string', nullable: false, primaryKey: true }, { name: 'CharacterSet', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['DatabaseName'] }, idField: 'DatabaseName' }
];

@registerSource('tencentdb')
export class TencentdbConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tencentdb', 'tencentdb', config, {
      baseUrl: config.host || 'https://cdb.tencentcloudapi.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
