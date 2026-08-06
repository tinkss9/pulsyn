// GCP Status — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'status', endpoint: '/incidents.json', schema: { name: 'status', table: 'status', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'external_desc', type: 'string', nullable: false, primaryKey: false }, { name: 'severity', type: 'string', nullable: false, primaryKey: false }, { name: 'begin', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('gcp-status')
export class GcpStatusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'gcp-status', 'gcp-status', config, {
      baseUrl: config.host || 'https://status.cloud.google.com',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/incidents.json',
    });
  }
}
