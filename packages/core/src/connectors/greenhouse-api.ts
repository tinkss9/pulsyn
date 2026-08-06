// Greenhouse API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'jobs', endpoint: '/jobs?per_page=20', schema: { name: 'jobs', table: 'jobs', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('greenhouse-api')
export class GreenhouseApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'greenhouse-api', 'greenhouse-api', config, {
      baseUrl: config.host || 'https://harvest.greenhouse.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/jobs',
    });
  }
}
