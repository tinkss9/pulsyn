// Alibaba TableStore — Alibaba TableStore — NoSQL wide-column store, IoT/BigData
// Auth: Alibaba Cloud AccessKey
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'tables', endpoint: '/ListTable', schema: { name: 'tables', table: 'tables', columns: [{ name: 'table_name', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['table_name'] }, idField: 'table_name' }
];

@registerSource('tablestore')
export class TablestoreConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'tablestore', 'tablestore', config, {
      baseUrl: config.host || 'https://{instance}.cn-hangzhou.ots.aliyuncs.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/ListTable',
    });
  }
}
