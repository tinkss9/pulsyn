// PagerDuty API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'incidents', endpoint: '/incidents?limit=20', schema: { name: 'incidents', table: 'incidents', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'title', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('pagerduty-api')
export class PagerdutyApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pagerduty-api', 'pagerduty-api', config, {
      baseUrl: config.host || 'https://api.pagerduty.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/incidents',
    });
  }
}
