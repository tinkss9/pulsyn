// StatusPage.io — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'status', endpoint: '/api/v2/status.json', schema: { name: 'status', table: 'status', columns: [        { name: 'status', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['status'] }, idField: 'status' }];

@registerSource('statuspage-io')
export class StatuspageIoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'statuspage-io', 'statuspage-io', config, { baseUrl: config.host || 'https://metastatuspage.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/api/v2/status.json' });
  }
}
