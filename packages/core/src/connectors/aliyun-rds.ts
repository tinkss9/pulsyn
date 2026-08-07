// Alibaba Cloud RDS — Alibaba Cloud RDS — MySQL/PostgreSQL/SQL Server managed service
// Auth: Alibaba Cloud AccessKey
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'instances', endpoint: '/?Action=DescribeDBInstances', schema: { name: 'instances', table: 'instances', columns: [{ name: 'DBInstanceId', type: 'string', nullable: false, primaryKey: true }, { name: 'DBInstanceDescription', type: 'string', nullable: false, primaryKey: false }, { name: 'DBInstanceStatus', type: 'string', nullable: false, primaryKey: false }, { name: 'Engine', type: 'string', nullable: false, primaryKey: false }, { name: 'EngineVersion', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['DBInstanceId'] }, idField: 'DBInstanceId' }
];

@registerSource('aliyun-rds')
export class AliyunRdsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'aliyun-rds', 'aliyun-rds', config, {
      baseUrl: config.host || 'https://rds.aliyuncs.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
