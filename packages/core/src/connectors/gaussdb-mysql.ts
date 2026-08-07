// Huawei GaussDB MySQL — Huawei GaussDB(for MySQL) — MySQL compatible distributed DB
// Auth: Huawei Cloud AK/SK
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'instances', endpoint: '/{project_id}/instances', schema: { name: 'instances', table: 'instances', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }, { name: 'engine_version', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('gaussdb-mysql')
export class GaussdbMysqlConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gaussdb-mysql', 'gaussdb-mysql', config, {
      baseUrl: config.host || 'https://gaussdb.cn-north-4.myhuaweicloud.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/{project_id}/instances',
    });
  }
}
