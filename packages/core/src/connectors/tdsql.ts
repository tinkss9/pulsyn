// Tencent TDSQL — Tencent TDSQL — distributed database, financial grade
// Auth: Tencent Cloud API Key
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'instances', endpoint: '/?Action=DescribeDBInstances', schema: { name: 'instances', table: 'instances', columns: [{ name: 'InstanceId', type: 'string', nullable: false, primaryKey: true }, { name: 'InstanceName', type: 'string', nullable: false, primaryKey: false }, { name: 'Status', type: 'string', nullable: false, primaryKey: false }, { name: 'Engine', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['InstanceId'] }, idField: 'InstanceId' }
];

@registerSource('tdsql')
export class TdsqlConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tdsql', 'tdsql', config, {
      baseUrl: config.host || 'https://tdsql.tencentcloudapi.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/',
    });
  }
}
